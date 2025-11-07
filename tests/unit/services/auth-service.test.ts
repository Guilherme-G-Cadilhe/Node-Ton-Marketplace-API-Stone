import { loginUser } from "../../../src/services/auth-service";
import * as UserRepository from "../../../src/repositories/user-repository";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { AuthError } from "../../../src/models/errors";

// 1. Simular (mockar) todos os módulos externos que o auth-service usa
jest.mock("../../../src/repositories/user-repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockedUserRepo = UserRepository as jest.Mocked<typeof UserRepository>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

const mockStoredUser = {
  PK: "USER#teste@ton.com",
  SK: "METADATA",
  name: "Usuário de Teste",
  passwordHash: "$2b$10$dlWbsFIAo1nSwHhDatba7eCv6..7I1bXucHoEx9ZRbl.rtPZfEbqS",
  role: "seller" as const, // 'as const' ajuda na tipagem
};

describe("AuthService (loginUser)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("deve retornar um token JWT para credenciais válidas", async () => {
    // Arrange (Preparar)
    // Simula o repositório encontrando o usuário
    mockedUserRepo.getUserByEmail.mockResolvedValue(mockStoredUser);
    // Simula o bcrypt dizendo que a senha bate
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    // Simula o JWT assinando sendo uma função que retorna uma string
    (mockedJwt.sign as jest.Mock).mockImplementation(() => "fake-jwt-token");

    const result = await loginUser("teste@ton.com", "senha123");

    // Assert (Verificar)
    expect(result.token).toBe("fake-jwt-token");
    expect(result.expiresIn).toBe(3600);
    // Verifica se as funções corretas foram chamadas com os parâmetros corretos
    expect(mockedUserRepo.getUserByEmail).toHaveBeenCalledWith("teste@ton.com");
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      "senha123",
      mockStoredUser.passwordHash
    );
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      {
        userId: mockStoredUser.PK,
        email: "teste@ton.com",
        role: "seller",
      },
      "test-secret",
      { expiresIn: "1h" }
    );
  });

  it("deve lançar AuthError para senha inválida", async () => {
    // O usuário é encontrado
    mockedUserRepo.getUserByEmail.mockResolvedValue(mockStoredUser);
    // Mas o bcrypt diz que a senha está errada
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Verificamos se a promessa é rejeitada com o erro específico
    await expect(loginUser("teste@ton.com", "senha-errada")).rejects.toThrow(
      AuthError
    );

    await expect(loginUser("teste@ton.com", "senha-errada")).rejects.toThrow(
      "Email ou senha inválidos."
    );

    // Garante que o JWT *não* foi chamado
    expect(mockedJwt.sign).not.toHaveBeenCalled();
  });

  it("deve lançar AuthError para um usuário que não existe", async () => {
    // O repositório retorna undefined
    mockedUserRepo.getUserByEmail.mockResolvedValue(undefined);

    await expect(
      loginUser("fantasma@ton.com", "qualquer-senha")
    ).rejects.toThrow("Email ou senha inválidos.");

    // Garante que nem o bcrypt nem o JWT foram chamados
    expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    expect(mockedJwt.sign).not.toHaveBeenCalled();
  });

  it("deve lançar um Erro interno se o JWT_SECRET não estiver configurado", async () => {
    delete process.env.JWT_SECRET;
    mockedUserRepo.getUserByEmail.mockResolvedValue(mockStoredUser);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    await expect(loginUser("teste@ton.com", "senha123")).rejects.toThrow(
      "JWT_SECRET não configurado no servidor."
    );
  });
});
