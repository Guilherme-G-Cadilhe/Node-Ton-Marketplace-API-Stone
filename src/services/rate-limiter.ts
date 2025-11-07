import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb";
import { RateLimitError } from "../models/errors";

const TABLE_NAME = process.env.TABLE_NAME!;

// VALORES ORIGINAIS (para produção)
const BUCKET_CAPACITY = 100;
const REFILL_RATE_PER_SECOND = 100 / 60; // ~1.67

// VALORES DE TESTE (para forçar o erro 429)
// const BUCKET_CAPACITY = 1; // Só 1 requisição
// const REFILL_RATE_PER_SECOND = 1; // Recarrega 1 token por segundo

interface TokenBucket {
  PK: string;
  SK: string;
  tokens: number;
  lastRefill: number; // Timestamp (em segundos)
}

/**
 * Busca ou cria um "balde" de tokens para um usuário
 */
async function getOrCreateBucket(userId: string): Promise<TokenBucket> {
  const pk = `RATE_LIMIT#${userId}`;
  const sk = "BUCKET";
  const now = Math.floor(Date.now() / 1000);

  const getCmd = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  });

  const result = await docClient.send(getCmd);

  if (result.Item) {
    return result.Item as TokenBucket;
  }

  // Se não existe, cria um novo balde
  const newBucket: TokenBucket = {
    PK: pk,
    SK: sk,
    tokens: BUCKET_CAPACITY,
    lastRefill: now,
  };
  return newBucket;
}

/**
 * Verifica se um usuário pode fazer uma requisição (consome 1 token)
 */
export async function consumeToken(userId: string): Promise<void> {
  const bucket = await getOrCreateBucket(userId);
  const now = Math.floor(Date.now() / 1000);

  // Calcular recarga
  const elapsed = now - bucket.lastRefill;
  const tokensToRefill = elapsed * REFILL_RATE_PER_SECOND;

  const currentTokens = Math.min(
    bucket.tokens + tokensToRefill,
    BUCKET_CAPACITY
  );

  if (currentTokens < 1) {
    // Não tem tokens, bloqueia!
    throw new RateLimitError("Too Many Requests");
  }

  const updateCmd = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: bucket.PK, SK: bucket.SK },
    // Atualiza os tokens e o lastRefill
    UpdateExpression: "SET #tokens = :newTokens, #lastRefill = :now",
    ExpressionAttributeNames: {
      "#tokens": "tokens",
      "#lastRefill": "lastRefill",
    },
    ExpressionAttributeValues: {
      ":newTokens": currentTokens - 1, // Consome 1
      ":now": now,
    },
  });

  await docClient.send(updateCmd);
}
