/* eslint-disable @typescript-eslint/no-require-imports */
// infra/scripts/wait-for-dynamodb.js
const { exec } = require("node:child_process");

// --- Configuração de Robustez ---
const MAX_RETRIES = 30; // 30 tentativas
const RETRY_DELAY_MS = 1000; // 1 segundo (Total max 30s de espera)
let currentRetries = 0;
// ------------------------------

function checkDynamo() {
  currentRetries++;

  // 1. Verifica se estouramos o limite de tentativas
  if (currentRetries > MAX_RETRIES) {
    console.error(
      `\n[ERRO] DynamoDB Local não respondeu após ${MAX_RETRIES} tentativas.`
    );
    console.error("Timeout. Abortando o build.");
    process.exit(1); // Falha o script (e o pipeline do CI)
  }

  // Tenta listar tabelas. Requer credenciais FAKE e região.
  exec(
    "aws dynamodb list-tables --endpoint-url http://localhost:8000 --region localhost --output text",
    {
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: "FAKE",
        AWS_SECRET_ACCESS_KEY: "FAKE",
      },
    },
    handleReturn
  );

  function handleReturn(error) {
    // 2. Verifica o critério de sucesso:
    //    Se 'error' for nulo, o comando 'aws' rodou, o que significa
    //    que o endpoint 'localhost:8000' respondeu.
    if (!error) {
      console.log("\n[DynamoDB Local está pronto!]\n");
      return; // Sucesso, para a recursão.
    }

    // 3. Se deu erro (ex: "connection refused"), loga e tenta de novo
    process.stdout.write("."); // Log de progresso
    setTimeout(checkDynamo, RETRY_DELAY_MS);
  }
}

process.stdout.write("\n[Aguardando DynamoDB Local]:");
checkDynamo();