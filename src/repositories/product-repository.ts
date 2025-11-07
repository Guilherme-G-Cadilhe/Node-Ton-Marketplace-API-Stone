import { QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ResourceNotFoundException } from "@aws-sdk/client-dynamodb";
import { docClient } from "../config/dynamodb";
import { DynamoCursor, StoredProduct } from "../models/product";
import { TableNotFoundError } from "../models/errors";

const TABLE_NAME = process.env.TABLE_NAME!;

// Interface para o resultado da nossa query
export interface ProductQueryResult {
  items: StoredProduct[];
  lastEvaluatedKey?: DynamoCursor;
}

/**
 * Busca produtos no banco de dados com paginação.
 */
export async function getProducts(
  limit: number,
  cursor?: DynamoCursor
): Promise<ProductQueryResult> {
  // Usamos 'Query' (rápido) e não 'Scan' (lento)
  // Estamos buscando todos os itens onde a "gaveta" (PK) começa com "PRODUCT#"
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    // Define o filtro na chave primária
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk_prefix)",
    ExpressionAttributeValues: {
      ":pk": "PRODUCTS", // A "gaveta" de todos os produtos
      ":sk_prefix": "PRODUCT#", // O prefixo dos itens de produto
    },
    Limit: limit,
    ExclusiveStartKey: cursor,
  });

  try {
    const result: QueryCommandOutput = await docClient.send(command);

    return {
      items: (result.Items ?? []) as StoredProduct[],
      lastEvaluatedKey: result.LastEvaluatedKey as DynamoCursor | undefined,
    };
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      console.error(`Tabela ${TABLE_NAME} não encontrada.`);
      throw new TableNotFoundError(TABLE_NAME);
    }
    console.error("Erro ao buscar produtos no DynamoDB:", error);
    throw new Error("Erro no repositório de dados");
  }
}
