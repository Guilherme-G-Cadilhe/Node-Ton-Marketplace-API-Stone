import * as ProductRepository from "../repositories/product-repository";
import { DynamoCursor, StoredProduct } from "../models/product";

interface PaginatedProductResponse {
  data: StoredProduct[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
}

/**
 * Codifica um objeto (LastEvaluatedKey) em uma string Base64 opaca
 */
function encodeCursor(cursorObj: DynamoCursor): string {
  return Buffer.from(JSON.stringify(cursorObj)).toString("base64");
}

/**
 * Decodifica o cursor Base64 de volta para um objeto
 */
function decodeCursor(cursorStr: string): DynamoCursor {
  return JSON.parse(Buffer.from(cursorStr, "base64").toString("ascii"));
}

/**
 * Lógica de negócio para listar produtos
 */
export async function listProducts(
  limit: number,
  cursor?: string
): Promise<PaginatedProductResponse> {
  const exclusiveStartKey = cursor ? decodeCursor(cursor) : undefined;

  const { items, lastEvaluatedKey } = await ProductRepository.getProducts(
    limit,
    exclusiveStartKey
  );

  const hasNext = !!lastEvaluatedKey;
  const nextCursor = lastEvaluatedKey ? encodeCursor(lastEvaluatedKey) : null;

  return {
    data: items,
    pagination: {
      limit: limit,
      hasNext: hasNext,
      nextCursor: nextCursor,
    },
  };
}
