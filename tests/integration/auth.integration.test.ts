import { PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./helpers/dynamoTestClient"; // Cliente REAL
import { loginUser } from "../../src/services/auth-service"; // Serviço REAL
import { AuthError } from "../../src/models/errors";
import * as bcrypt from "bcryptjs";

const TEST_EMAIL = "integration.test@ton.com";
const TEST_PASSWORD = "Password@123";
const TEST_PK = `USER#${TEST_EMAIL}`;
const TEST_SK = "METADATA";
let PASSWORD_HASH = "";

// --- Hooks de Setup e Teardown ---
beforeAll(async () => {
  PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: TEST_PK,
          SK: TEST_SK,
          name: "Usuário de Teste de Integração",
          email: TEST_EMAIL,
          passwordHash: PASSWORD_HASH,
          role: "seller",
        },
      })
    );
  } catch (e) {
    let errorMessage = "Erro desconhecido";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error(
      "ERRO: O DynamoDB Local (Docker) não parece estar rodando.",
      errorMessage
    );
    throw e;
  }
});

afterAll(async () => {
  // Limpa o usuário de teste
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: TEST_PK, SK: TEST_SK },
      })
    );
  } catch (e) {
    let errorMessage = "Erro desconhecido";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error("ERRO: Falha ao limpar o usuário de teste.", errorMessage);
  }
});

describe("AuthService (Integration)", () => {
  it("deve autenticar e retornar um token JWT para credenciais válidas", async () => {
    const result = await loginUser(TEST_EMAIL, TEST_PASSWORD);

    expect(result).toBeDefined();
    expect(result.token).toEqual(expect.any(String));
    expect(result.expiresIn).toBe(3600);
  });

  it("deve lançar AuthError para uma senha incorreta", async () => {
    await expect(loginUser(TEST_EMAIL, "senha-errada-123")).rejects.toThrow(
      AuthError
    );

    await expect(loginUser(TEST_EMAIL, "senha-errada-123")).rejects.toThrow(
      "Email ou senha inválidos."
    );
  });

  it("deve lançar AuthError para um usuário que não existe", async () => {
    await expect(
      loginUser("fantasma@ton.com", "qualquer-senha")
    ).rejects.toThrow(AuthError);

    await expect(
      loginUser("fantasma@ton.com", "qualquer-senha")
    ).rejects.toThrow("Email ou senha inválidos.");
  });
});
