import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Força a conexão com o DynamoDB local no Docker
const client = new DynamoDBClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "FAKE",
    secretAccessKey: "FAKE",
  },
});

export const docClient = DynamoDBDocumentClient.from(client);
