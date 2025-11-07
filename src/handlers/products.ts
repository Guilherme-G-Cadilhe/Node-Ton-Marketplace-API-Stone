import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyHandlerV2,
} from "aws-lambda";
import { ZodError } from "zod";
import { listProductsSchema } from "../schemas/product-schemas";
import { listProducts } from "../services/product-service";
import { consumeToken } from "../services/rate-limiter";
import { RateLimitError, TableNotFoundError } from "../models/errors";
import { logger } from "../utils/logger";

interface AuthorizerLambdaPayload {
  userId: string;
  email: string;
  role: string;
}

type CustomRequestContext = APIGatewayEventRequestContextV2 & {
  authorizer: {
    lambda: AuthorizerLambdaPayload;
  };
};
/**
 * Handler da Lambda para GET /products
 * Esta rota é PROTEGIDA pelo jwtAuthorizer
 */
export const list: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const requestContext = event.requestContext as CustomRequestContext;
    const authorizerContext = requestContext.authorizer.lambda;
    if (!authorizerContext || !authorizerContext?.userId) {
      throw new Error("Unauthorized");
    }

    logger.info("Usuário acessando produtos", {
      userId: authorizerContext.userId,
      email: authorizerContext?.email,
      role: authorizerContext?.role,
    });

    await consumeToken(authorizerContext.userId);
    const { limit, cursor } = listProductsSchema.parse(
      event.queryStringParameters ?? {}
    );

    const result = await listProducts(limit, cursor);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof TableNotFoundError) {
      logger.error("Infraestrutura indisponível no list", error as Error, {
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

    if (error instanceof RateLimitError) {
      logger.warn("Limite de requisições atingido", error as Error);
      return {
        statusCode: 429, // Too Many Requests
        body: JSON.stringify({ message: error.message }),
      };
    }
    if (error instanceof ZodError) {
      logger.warn("Erro nos parâmetros da query", {
        errors: error.issues.map((i) => i.message),
        body: event.body,
      });
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({
          message: "Erro nos parâmetros da query.",
          errors: error.issues.map((i) => ({
            message: i.message,
            path: i.path,
          })),
        }),
      };
    }

    logger.error("Erro inesperado ao listar produtos", error as Error, {
      body: event.body,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro interno do servidor." }),
    };
  }
};
