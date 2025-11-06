import { mockClient } from "aws-sdk-client-mock";
import { docClient } from "../../../src/config/dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  consumeToken,
  RateLimitError,
} from "../../../src/services/rate-limiter";

const dynamoMock = mockClient(docClient);

const testUserId = "USER#teste@ton.com";
const testRateLimitPk = `RATE_LIMIT#${testUserId}`;
const testBucketSk = "BUCKET";

describe("RateLimiterService (consumeToken)", () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  it("deve criar um novo balde e consumir 1 token para um usuário novo", async () => {
    // Simula o GetCommand não encontrando nada (usuário novo)
    dynamoMock.on(GetCommand).resolves({});
    // Simula o UpdateCommand funcionando (não precisamos de retorno)
    dynamoMock.on(UpdateCommand).resolves({});

    await expect(consumeToken(testUserId)).resolves.not.toThrow();

    const updateCalls = dynamoMock.commandCalls(UpdateCommand);
    expect(updateCalls).toHaveLength(1); // Foi chamado 1 vez

    const commandInput = updateCalls[0]!.args[0]!.input!;
    // Verificamos se ele tentou salvar o balde com 99 tokens (100 - 1)
    expect(commandInput.ExpressionAttributeValues![":newTokens"]).toBe(99);
  });

  it("deve lançar RateLimitError se o balde estiver vazio", async () => {
    const now = Math.floor(Date.now() / 1000);
    dynamoMock.on(GetCommand).resolves({
      Item: {
        PK: testRateLimitPk,
        SK: testBucketSk,
        tokens: 0,
        lastRefill: now, // O 'lastRefill' é 'agora', então não há recarga
      },
    });

    await expect(consumeToken(testUserId)).rejects.toThrow(RateLimitError);
    await expect(consumeToken(testUserId)).rejects.toThrow("Too Many Requests");

    // Garante que o UpdateCommand *não* foi chamado
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
  });

  it("deve recarregar os tokens antes de consumir", async () => {
    jest.useFakeTimers();
    // Definimos que 'agora' é este timestamp
    const now = 1700000000;
    jest.setSystemTime(new Date(now * 1000));

    // Simula que o último 'refill' foi 60 segundos atrás
    const sixtySecondsAgo = now - 60;

    dynamoMock.on(GetCommand).resolves({
      Item: {
        PK: testRateLimitPk,
        SK: testBucketSk,
        tokens: 10, // Tinha 10 tokens
        lastRefill: sixtySecondsAgo,
      },
    });
    dynamoMock.on(UpdateCommand).resolves({});

    await expect(consumeToken(testUserId)).resolves.not.toThrow();

    // O Rate Limiter é 100 tokens / 60s (REFILL_RATE_PER_SECOND = 1.666)
    // Tokens a recarregar = 60s * (100/60) = 100
    // Tokens atuais = min(10 (antigos) + 100 (recarga), 100 (capacidade)) = 100
    // Tokens novos = 100 - 1 (consumo) = 99
    const updateCalls = dynamoMock.commandCalls(UpdateCommand);
    expect(updateCalls).toHaveLength(1);

    const commandInput = updateCalls[0]!.args[0]!.input!;
    expect(commandInput.ExpressionAttributeValues![":newTokens"]).toBe(99);

    // Limpa o mock de tempo
    jest.useRealTimers();
  });
});
