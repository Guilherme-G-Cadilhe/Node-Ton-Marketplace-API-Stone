# Desafio de Backend: Ton Marketplace API

API robusta e escalável construída para o desafio de Software Engineer Pleno (SWE III) da Stone/Ton, focada em performance, qualidade de código e alinhamento com a arquitetura Serverless-First da Stone.

O projeto implementa todos os requisitos obrigatórios e "Plus", incluindo testes de unidade, documentação OpenAPI e prova de conceito com Terraform.

## 🚀 Arquitetura da Solução (AWS Serverless)

A arquitetura é 100% Serverless, otimizada para performance e custo zero (Free Tier).

- **API Gateway (HTTP API):** Gerencia os endpoints e o tráfego.
- **AWS Lambda (Node.js 20.x):** Executa a lógica de negócio (stateless).
- **DynamoDB (Single-Table):** Banco de dados NoSQL performático para persistência.
- **Custom Authorizer:** Uma Lambda dedicada que valida tokens JWT, protegendo as rotas privadas.

## ✨ Features Implementadas

- [x] **Autenticação JWT:** Endpoint `POST /auth/login` seguro com `bcrypt`.
- [x] **Rota Protegida:** Endpoint `GET /products` validado via `jwtAuthorizer`.
- [x] **Paginação (Cursor-Based):** Paginação performática no DynamoDB, retornando um cursor Base64 opaco.
- [x] **Rate Limiting (Token Bucket):** Proteção de rota com 100 req/min por usuário, persistido no DynamoDB.
- [x] **Testes de Unidade (100%):** Cobertura de 100% em toda a camada de _Serviços_ (auth, products, rate-limiter) usando Jest e Mocks.
- [x] **Qualidade de Código:** Configurado com ESLint, Prettier e Commits Semânticos (commitzen).
- [x] **Documentação de API:** Arquivo `openapi.json` gerado automaticamente (veja como rodar abaixo).
- [x] **Documentação de Arquitetura (ADRs):** Decisões de design documentadas em `docs/adrs/`.

---

## 🔧 Setup & Execução Local

O projeto utiliza um ambiente de 3 terminais para simular a nuvem da AWS localmente.

### Pré-requisitos

- Node.js 20.x
- Docker Desktop (precisa estar rodando)
- AWS CLI (Configurado com credenciais 'fake')

_(Para instruções detalhadas de configuração do AWS CLI local, veja o `seeds/README.md`)_

---

### Terminal 1: Iniciar o Banco de Dados (Docker)

Este comando inicia um contêiner do DynamoDB Local na porta 8000. A flag `-sharedDb` é essencial para o funcionamento correto com o AWS CLI.
(Obs: A Flag `-inMemory` para o conteúdo ficar apenas em memoria está ativa)

```bash
docker run -d --name dynamo \
  -p 8000:8000 \
  amazon/dynamodb-local \
  -jar DynamoDBLocal.jar -sharedDb -inMemory
```

### Terminal 2: Iniciar a API (Serverless)

Este comando inicia a API localmente na http://localhost:3000

```bash
serverless offline
```

(ou sls offline se você tiver o Serverless instalado globalmente)

### Terminal 3: Preparar e Semear o Banco (Seed Script)

Uma vez que os Terminais 1 e 2 estejam rodando, use os scripts na pasta /seeds para criar a tabela e popular todos os dados de teste (usuário e produtos) automaticamente.

**No Windows (PowerShell):**

```bash
.\seeds\windows-seed-dynamodb.ps1
```

**No Linux/Mac/Git Bash:**

```bash
# Dê permissão na primeira vez
chmod +x seeds/bash-seed-dynamodb.sh

# Execute o script
./seeds/bash-seed-dynamodb.sh
```

## 🚀 Testes e Qualidade

O projeto é configurado para garantir a qualidade do código.

**Testes Unitários**
Rode a suíte de testes completa (com cobertura) para a camada de serviços:

```bash
npm test
```

**Lint & Formatação**
Verifique erros de lint ou corrija a formatação:

```bash
# Apenas verificar

npm run lint
npm run format:check

# Corrigir automaticamente

npm run lint:fix
npm run format
```

**Gerar Documentação OpenAPI**
Para gerar o arquivo openapi.json:

```bash
npx serverless openapi generate -o openapi.json -f json
```

## 🏛️ Processo de Desenvolvimento (Workflow)

Este projeto foi gerenciado profissionalmente usando o GitHub, Para dar visibilidade a outros desenvolvedores:

- **Issues:** Cada feature ou bug foi rastreado em uma Issue.
- **Commits Semânticos:** Os commits seguem o padrão `feat:`, `fix`:, `docs:`, `test:`, etc., usando `npm run commit` (commitzen).
- **Pull Requests (PRs):** Todo código foi mesclado via PRs, preparando para a automação de CI/CD.
