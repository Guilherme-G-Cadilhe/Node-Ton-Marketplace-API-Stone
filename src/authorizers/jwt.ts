import { APIGatewayRequestSimpleAuthorizerHandlerV2 } from "aws-lambda";
import * as jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Este é o nosso "porteiro" (Custom Authorizer).
 * Valida o token JWT enviado no header Authorization.
 */
export const handler: APIGatewayRequestSimpleAuthorizerHandlerV2 = async (
  event
) => {
  const authHeader =
    event.headers?.authorization ?? event.headers?.Authorization;
  const token = authHeader?.replace("Bearer ", "");
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    console.error("Token ou Secret ausente. Lançando erro.");
    throw new Error("Unauthorized"); // 401
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    return {
      principalId: decoded.userId, // ID do usuário
      isAuthorized: true,
      context: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    };
  } catch (error) {
    console.error("Falha na validação do JWT:", error);
    throw new Error("Unauthorized"); // 401
  }
};
