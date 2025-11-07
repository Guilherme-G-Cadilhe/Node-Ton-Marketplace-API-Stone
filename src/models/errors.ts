// Erro de lógica de autenticação (usuário/senha)
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// Erro de limite de requisições
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

// Erro de infraestrutura (tabela faltando)
export class TableNotFoundError extends Error {
  constructor(tableName: string) {
    super(
      `Tabela '${tableName}' não encontrada. Você rodou o script de seed? (ex: ./seeds/bash-seed-dynamodb.sh)`
    );
    this.name = "TableNotFoundError";
  }
}
