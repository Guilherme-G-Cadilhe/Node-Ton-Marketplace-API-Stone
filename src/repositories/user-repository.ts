import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb";
import { StoredUser } from "../models/user";

// Pega o nome da tabela das variáveis de ambiente
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * Busca um usuário pelo email (que compõe a PK)
 */
export async function getUserByEmail(
  email: string
): Promise<StoredUser | undefined> {
  const pk = `USER#${email}`;
  const sk = "METADATA";

  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: pk,
      SK: sk,
    },
  });

  try {
    const result = await docClient.send(command);

    return result.Item as StoredUser | undefined;
  } catch (error) {
    console.error("Erro ao buscar usuário no DynamoDB:", error);
    throw new Error("Erro no repositório de dados");
  }
}
