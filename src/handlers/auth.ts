import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ZodError } from "zod";
import { loginSchema } from "../schemas/auth-schemas";
import { loginUser } from "../services/auth-service";
import { AuthError, TableNotFoundError } from "../models/errors";
import { logger } from "../utils/logger";

/**
 * Handler da Lambda para POST /auth/login
 */
export const login: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const { email, password } = loginSchema.parse(body);

    const result = await loginUser(email, password);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof TableNotFoundError) {
      logger.error("Infraestrutura indisponível no login", error as Error, {
        hint: error.message,
      });
      return {
        statusCode: 503, // 503 Service Unavailable (boa prática para infra faltando)
        body: JSON.stringify({
          message: "Serviço temporariamente indisponível.",
          hint: error.message,
        }),
      };
    }

    if (error instanceof ZodError) {
      logger.warn("Falha de validação no login", {
        errors: error.issues.map((i) => i.message),
        body: event.body,
      });
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
      logger.warn("Credenciais inválidas", {
        email: JSON.parse(event.body ?? "{}")?.email,
      });
      return {
        statusCode: 401, // Unauthorized
        body: JSON.stringify({ message: error.message }),
      };
    }

    logger.error("Erro inesperado no login", error as Error, {
      body: event.body,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro interno do servidor." }),
    };
  }
};
