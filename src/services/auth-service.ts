import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as UserRepository from "../repositories/user-repository";

// Criamos um erro customizado para lidar com falhas de login
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Lógica de negócio para login
 */
export async function loginUser(email: string, passwordInput: string) {
  const user = await UserRepository.getUserByEmail(email);
  if (!user) {
    throw new AuthError("Email ou senha inválidos.");
  }

  const isPasswordValid = await bcrypt.compare(
    passwordInput,
    user.passwordHash
  );
  if (!isPasswordValid) {
    throw new AuthError("Email ou senha inválidos.");
  }

  const secret = process.env.JWT_SECRET!;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no servidor.");
  }

  const payload = {
    userId: user.PK, // Passamos o PK (USER#email) como ID
    email: email,
    role: user.role,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: "1h",
  });

  return {
    token: token,
    expiresIn: 3600,
  };
}
