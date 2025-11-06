import { listProducts } from "../../../src/services/product-service";
import * as ProductRepository from "../../../src/repositories/product-repository";
import { StoredProduct } from "../../../src/models/product";

jest.mock("../../../src/repositories/product-repository");

const mockedProductRepo = ProductRepository as jest.Mocked<
  typeof ProductRepository
>;

const mockProduct: StoredProduct = {
  PK: "PRODUCTS",
  SK: "PRODUCT#01",
  name: "Máquina T1",
  description: "...",
  price: 11880,
  category: "maquinas",
};

// O cursor (LastEvaluatedKey) que o DynamoDB retorna (um objeto)
const mockCursorObject = {
  PK: "PRODUCTS",
  SK: "PRODUCT#01",
};

// O mesmo cursor, mas como o serviço o expõe (Base64 string)
// "{\"PK\":\"PRODUCTS\",\"SK\":\"PRODUCT#01\"}" em Base64
const mockCursorString = "eyJQSyI6IlBST0RVQ1RTIiwiU0siOiJQUk9EVUNUIzAxIn0=";

describe("ProductService (listProducts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar a primeira página de produtos e um nextCursor", async () => {
    // Deve retornar 1 item e um cursor (lastEvaluatedKey)
    mockedProductRepo.getProducts.mockResolvedValue({
      items: [mockProduct],
      lastEvaluatedKey: mockCursorObject,
    });

    // Serviço sem cursor (primeira página)
    const result = await listProducts(10, undefined);

    expect(result.data).toEqual([mockProduct]);
    expect(result.pagination.hasNext).toBe(true);
    // Verifica se o serviço codificou o cursor corretamente para Base64
    expect(result.pagination.nextCursor).toBe(mockCursorString);
    // Verifica se o repositório foi chamado com os parâmetros corretos
    expect(mockedProductRepo.getProducts).toHaveBeenCalledWith(10, undefined);
  });

  it("deve decodificar o cursor e retornar a última página", async () => {
    // Deve retornar o item final e nenhum cursor
    mockedProductRepo.getProducts.mockResolvedValue({
      items: [mockProduct],
      lastEvaluatedKey: undefined, // Esta é a última página
    });

    // Chamamos o serviço passando o cursor Base64 (segunda página)
    const result = await listProducts(10, mockCursorString);

    // Assert
    expect(result.data).toEqual([mockProduct]);
    expect(result.pagination.hasNext).toBe(false); // Não há próxima página
    expect(result.pagination.nextCursor).toBe(null); // Cursor é nulo
    // Verifica se o serviço *decodificou* o cursor de volta para o objeto
    expect(mockedProductRepo.getProducts).toHaveBeenCalledWith(
      10,
      mockCursorObject
    );
  });

  // --- Teste 3: Estado Vazio ---
  it("deve retornar uma lista vazia se não houver produtos", async () => {
    mockedProductRepo.getProducts.mockResolvedValue({
      items: [],
      lastEvaluatedKey: undefined,
    });

    const result = await listProducts(10, undefined);
    expect(result.data).toEqual([]);
    expect(result.pagination.hasNext).toBe(false);
  });
});
