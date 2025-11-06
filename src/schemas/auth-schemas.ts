import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email é obrigatório." })
    .email("Formato de email inválido."),
  password: z
    .string()
    .nonempty({ message: "Senha é obrigatória." })
    .min(6, "Senha deve ter no mínimo 6 caracteres."),
});
