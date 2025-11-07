import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ZodError } from "zod";
import { loginSchema } from "../schemas/auth-schemas";
import { loginUser } from "../services/auth-service";
import { AuthError, TableNotFoundError } from "../models/errors";

/**
 * Handler da Lambda para POST /auth/login
 */
export const login: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const { email, password } = loginSchema.parse(body);

    const result = await loginUser(email, password);

    // 3. Sucesso: Retorna 200 com o token
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof TableNotFoundError) {
      return {
        statusCode: 503, // 503 Service Unavailable (boa prática para infra faltando)
        body: JSON.stringify({
          message: "Serviço temporariamente indisponível.",
          hint: error.message,
        }),
      };
    }

    if (error instanceof ZodError) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({
          message: "Erro de validação.",
          errors: error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        }),
      };
    }

    if (error instanceof AuthError) {
      return {
        statusCode: 401, // Unauthorized
        body: JSON.stringify({ message: error.message }),
      };
    }

    console.error("Erro inesperado no login:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro interno do servidor." }),
    };
  }
};
