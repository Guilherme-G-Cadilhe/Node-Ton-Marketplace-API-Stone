import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// O 'serverless-offline' define esta variável de ambiente
const isOffline = process.env.IS_OFFLINE === "true";

const clientConfig = {
  region: "us-east-1",
};

if (isOffline) {
  Object.assign(clientConfig, {
    region: "localhost", // Região fictícia para local
    endpoint: "http://localhost:8000", // Aponta para nosso Docker!
    credentials: {
      accessKeyId: "FAKE",
      secretAccessKey: "FAKE",
    },
  });
  // console.log("CONECTADO AO DYNAMODB LOCAL (DOCKER)");
} else {
  // Em produção (na AWS), ele usará as credenciais da Lambda automaticamente
  // console.log("CONECTADO AO DYNAMODB (AWS)");
}

const client = new DynamoDBClient(clientConfig);

// O DocumentClient é um 'facilitador' para não termos que lidar com
// tipos complexos do DynamoDB (ex: { "S": "meu_valor" })
// Ele nos deixa usar JSON puro (ex: { "meu_valor": "meu_valor" })
const docClient = DynamoDBDocumentClient.from(client);
export { docClient };
