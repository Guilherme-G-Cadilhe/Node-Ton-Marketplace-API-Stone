import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./helpers/dynamoTestClient"; // Cliente REAL
import { listProducts } from "../../src/services/product-service"; // O Serviço REAL
import { StoredProduct } from "../../src/models/product";

// Dados de teste
const seedProducts: StoredProduct[] = [
  {
    PK: "PRODUCTS",
    SK: "PRODUCT#01",
    name: "Produto 1",
    price: 100,
    description: "...",
    category: "maquinas",
  },
  {
    PK: "PRODUCTS",
    SK: "PRODUCT#02",
    name: "Produto 2",
    price: 200,
    description: "...",
    category: "maquinas",
  },
  {
    PK: "PRODUCTS",
    SK: "PRODUCT#03",
    name: "Produto 3",
    price: 300,
    description: "...",
    category: "insumos",
  },
];

/**
 * Limpa a tabela antes de começar
 */
async function clearTable() {
  const scan = await docClient.send(
    new ScanCommand({
      TableName: process.env.TABLE_NAME,
      ProjectionExpression: "PK, SK",
    })
  );

  if (scan.Items && scan.Items.length > 0) {
    for (const item of scan.Items) {
      await docClient.send(
        new DeleteCommand({
          TableName: process.env.TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
        })
      );
    }
  }
}

/**
 * Insere os dados de seed
 */
async function seedTable() {
  for (const product of seedProducts) {
    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: product,
      })
    );
  }
}

// --- SUITE DE TESTES ---

describe("ProductService (Integration)", () => {
  beforeAll(async () => {
    try {
      // Limpa e popula o banco de dados do Docker
      await clearTable();
      await seedTable();
    } catch (e) {
      console.error(
        "ERRO: O DynamoDB Local (Docker) não parece estar rodando."
      );
      throw e;
    }
  });

  afterAll(async () => {
    await clearTable();
  });

  it("deve listar a primeira página de produtos corretamente", async () => {
    // Testamos a paginação com 2 itens por página
    const result = await listProducts(2, undefined);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe("Produto 1");
    expect(result.data[1].name).toBe("Produto 2");

    // Verificamos o cursor de paginação
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.nextCursor).toBeDefined();
  });

  it("deve listar a segunda página (final) usando o cursor", async () => {
    const firstPage = await listProducts(2, undefined);
    const cursor = firstPage.pagination.nextCursor;
    const secondPage = await listProducts(2, cursor!);

    expect(secondPage.data).toHaveLength(1);
    expect(secondPage.data[0].name).toBe("Produto 3");

    expect(secondPage.pagination.hasNext).toBe(false);
    expect(secondPage.pagination.nextCursor).toBeNull();
  });
});
