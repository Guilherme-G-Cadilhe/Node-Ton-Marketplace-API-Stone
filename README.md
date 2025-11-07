# Desafio de Backend: Ton Marketplace API

API robusta e escalável construída para o desafio de Software Engineer Pleno (SWE III) da Stone/Ton, focada em performance, qualidade de código e alinhamento com a arquitetura Serverless-First da Stone.

O projeto implementa todos os requisitos obrigatórios e "Plus"

## 🚀 Arquitetura da Solução (AWS Serverless)

A arquitetura é 100% Serverless, otimizada para performance, custo (Free Tier) e alinhada com a stack principal da Stone.

```text
                                    ┌──────────────────────────┐
                                    │        Cliente           │
                                    │ (Front-end / Postman)    │
                                    └────────────┬─────────────┘
                                                 │
                                                 ▼
                                    ┌──────────────────────────┐
                                    │    API Gateway (HTTP)    │
                                    │ - /auth/login (POST)     │
                                    │ - /products (GET)        │
                                    └────────────┬─────────────┘
                                                 │
                              Valida JWT via     │
                              Custom Authorizer  │
                                                 ▼
                                  ┌────────────────────────┐
                                  │   jwtAuthorizer        │
                                  │ (Lambda Authorizer)    │
                                  └────────────┬───────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
                        ▼                      ▼                      ▼
            ┌──────────────────┐     ┌────────────────────────────────────┐
            │  authLogin        │     │  getProducts                      │
            │  (Lambda)         │     │  (Lambda)                         │
            │------------------│     │------------------------------------│
            │ - Autentica user │     │ - Valida JWT (via Authorizer)     │
            │ - Gera JWT       │     │ - Executa Rate Limiter interno    │
            │                  │     │ - Consulta produtos no DynamoDB   │
            └────────┬─────────┘     └──────────────┬────────────────────┘
                     │                              │
                     └──────────────┬───────────────┘
                                    ▼
                             ┌────────────────────────────┐
                             │        DynamoDB            │
                             │ (Single-Table: Users,      │
                             │  Products, RateLimiter)    │
                             └────────────────────────────┘
                                               │
                                               ▼
                                   ┌────────────────────────┐
                                   │     CloudWatch Logs    │
                                   │ (Monitoring & Métricas)│
                                   └────────────────────────┘


```

- **API Gateway (HTTP API):** Gerencia os endpoints, rotas e CORS.
- **AWS Lambda (Node.js 20.x):** Executa a lógica de negócio (stateless).
- **DynamoDB (Single-Table):** Banco de dados NoSQL performático para persistência de Usuários, Produtos e estado do Rate Limiter.
- **Custom Authorizer:** Uma Lambda dedicada que valida tokens JWT, protegendo as rotas privadas de forma centralizada.
- **CloudWatch:** Coleta logs de todas as Lambdas, essencial para o troubleshooting

## ✨ Features Implementadas

- [x] **Autenticação JWT:** Endpoint `POST /auth/login` seguro com `bcrypt`.
- [x] **Rota Protegida:** Endpoint `GET /products` validado via `jwtAuthorizer`.
- [x] **Paginação (Cursor-Based):** Paginação performática no DynamoDB, retornando um cursor Base64 opaco.
- [x] **Rate Limiting (Token Bucket):** Proteção de rota com 100 req/min por usuário, persistido no DynamoDB.
- [x] **Testes de Unidade (100%):** Cobertura de 100% em toda a camada de _Serviços_ (auth, products, rate-limiter) usando Jest e Mocks.
- [x] **Qualidade de Código:** Configurado com ESLint, Prettier e Commits Semânticos (commitzen).
- [x] **Documentação de API:** Arquivo `openapi.json` gerado automaticamente (veja como rodar abaixo).
- [x] **Documentação de Arquitetura (ADRs):** Decisões de design documentadas em `docs/adrs/`.
- [x] **CI/CD com GitHub Actions:** Workflows automatizados (em `.github/workflows/`) para rodar Lint, Formatação, Testes e Verificação de Commits em todo Pull Request, garantindo a qualidade e estabilidade da `main`.
- [x] **Infra as Code (IaC) Dupla:** Uso do **Serverless Framework** para deploy rápido de Lambdas/API e **Terraform** (na pasta `/terraform`) como "prova de conceito" para gerenciar a infraestrutura base (DynamoDB), atendendo aos "Plus" do desafio.
- [x] **Validação Robusta com Zod:** Validação de schema em _runtime_ que garante que nenhum dado mal formatado (ex: email inválido, senha curta) chegue à camada de serviço.
- [x] **Bundling Otimizado (esbuild):** Uso do `serverless-esbuild` para tree-shaking e bundling, resultando em pacotes de deploy minúsculos (ex: 352kB), cold starts mais rápidos e correção de bugs de deploy (como `EMFILE`).
- [x] **Tratamento de Erro Explícito:** Classes de erro customizadas (ex: `AuthError`, `RateLimitError`) e handlers que retornam os status codes HTTP corretos (400, 401, 429, 503), melhorando a experiência do cliente.
- [x] **Ambiente de Dev Completo:** Configuração 100% local com `serverless offline` + DynamoDB (Docker) e scripts de _seed_ para popular o banco, provendo uma excelente Developer Experience (DevEx).

---

## 📁 Estrutura do Projeto

A estrutura do projeto segue princípios de SOLID e separação de responsabilidades (SoC), facilitando manutenção, escalabilidade e testes.

```text
ton-marketplace-api/
├── docs/
│   └── adrs/                 # Decisões de arquitetura (ADRs)
├── seeds/                    # Scripts para popular o banco
├── src/
│   ├── authorizers/          # Lambdas de autorização (JWT)
│   ├── config/               # Configuração de clientes (DynamoDB)
│   ├── handlers/             # Camada HTTP (Request/Response)
│   ├── models/               # Tipos e interfaces (Entities)
│   ├── repositories/         # Camada de acesso a dados (Data Access)
│   ├── schemas/              # Validação de entrada (Zod)
│   └── services/             # Lógica de negócio (Business Logic)
├── tests/
│   └── unit/                 # Testes unitários da camada de serviços
├── .gitignore
├── eslint.config.js          # Regras de lint
├── jest.config.js            # Configuração do Jest
├── openapi.json              # Documentação da API
├── package.json
├── serverless.yml            # Definição da infraestrutura (IaC)
└── tsconfig.json
```

---

## 📖 Documentação da API (OpenAPI)

A API está documentada usando a especificação OpenAPI 3.0.

- **Arquivo Fonte:** `openapi.json`
- **Visualizador Interativo:** **[Clique aqui para ver a Documentação da API (Swagger UI)](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/Guilherme-G-Cadilhe/Node-Ton-Marketplace-API-Stone/main/openapi.json)**

---

## 🧪 Testando a API na AWS (Produção)

A API foi deployada na AWS e está disponível nos seguintes endpoints:

- **GET `/health`**: `https://vwnbt8pifi.execute-api.us-east-1.amazonaws.com/health`
- **POST `/auth/login`**: `https://vwnbt8pifi.execute-api.us-east-1.amazonaws.com/auth/login`
- **GET `/products`**: `https://vwnbt8pifi.execute-api.us-east-1.amazonaws.com/products`

### Como Testar (Fluxo Rápido)

1.  **Faça Login (POST):**
    Envie um `POST` para `.../auth/login` com o body:

    ```json
    {
      "email": "teste@ton.com",
      "password": "senha123"
    }
    ```

2.  **Copie o Token:**
    Você receberá uma resposta com o token JWT:

    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "expiresIn": 3600
    }
    ```

3.  **Liste os Produtos (GET):**
    Faça um `GET` para `.../products` e adicione o token no header `Authorization`:
    - **Header:** `Authorization`
    - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...`

4.  **(Opcional) Teste a Paginação:**
    Na resposta de `/products`, defina um `limit` pegue o `nextCursor` e o envie como query param na próxima requisição:
    - `GET .../products?limit=1&cursor=eyJQSyI6IlBST...`

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

Este comando inicia um contêiner do DynamoDB Local na porta 8000. A flag `-sharedDb` é essencial para o funcionamento correto com o AWS CLI. <br>
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

### 🏛️ Nota sobre IaC: Serverless Framework vs. Terraform

Este projeto usa duas formas de IaC para propósitos diferentes, demonstrando uma arquitetura híbrida realista:

1.  **Serverless Framework (`serverless.yml`):** Usado para o deploy da "aplicação" (Lambdas, API Gateway, Authorizer, Roles IAM). É ideal para a alta produtividade no ciclo de vida da aplicação.
2.  **Terraform (`/terraform`):** Fornecido como "prova de conceito" (um "Plus" do desafio) para gerenciar a infraestrutura "base" ou "agnóstica" (como a tabela DynamoDB). Em um time maior, a tabela seria criada pelo Terraform, e as Lambdas (via Serverless Framework) apenas receberiam o nome da tabela (`TABLE_NAME`) como variável de ambiente.

O Terraform neste projeto **não** quebra o deploy do Serverless, pois é demonstrativo e gerenciaria recursos diferentes.

---

---

## ☁️ Deploy na AWS (Instruções para Avaliador)

O projeto está 100% configurado para deploy na AWS. O `serverless.yml` na `main` está com as permissões IAM comentadas para garantir que o `serverless offline` funcione sem credenciais.

Para fazer o deploy do projeto na sua própria conta AWS, siga os passos:

1.  **Configurar Credenciais:** Garanta que você tenha um perfil AWS válido configurado no seu CLI. (ex: `aws configure --profile seu-perfil-de-deploy`)

2.  **Editar `serverless.yml`:** Descomente o bloco `provider.iam` dentro do `serverless.yml`.

    ```yaml
    # DESCOMENTE AQUI
    iam:
      role:
        statements:
          - Effect: "Allow"
            Action:
              - "dynamodb:GetItem"
              - "dynamodb:Query"
              - "dynamodb:UpdateItem"
            Resource:
              - "arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:custom.tableName}"
    ```

3.  **Executar o Deploy:**
    Rode o comando de deploy apontando para seu perfil:

    ```bash
    npx serverless deploy --stage dev --aws-profile seu-perfil-de-deploy
    ```

4.  **Popular o Banco (Seed):**
    Após o deploy, use o script de seed para a AWS (lembre-se de atualizar o nome do perfil no script, se necessário).
    ```bash
    ./seeds/aws-seed.sh
    ```

---

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

## 📚 Minha Jornada de Aprendizado no Desafio

Este desafio foi uma imersão que me permitiu não só aprender, mas reforçar conceitos fundamentais da stack Serverless da AWS, alinhado à cultura da Stone.

1.  **Serverless & Lambdas:**
    - Aprendi que Lambdas são focadas em _eventos_ e _funções_, não em _servidores_. Que exigem uma arquitetura diferente, onde o estado é gerenciado externamente (ex: DynamoDB).

2.  **Reforço em TypeScript e Testes:**
    - Embora eu já usasse TypeScript e Testes, este projeto foi uma oportunidade de reforço para aplicar tipos de forma mais estrita, criar schemas de validação robustos com Zod e estruturar melhor mocks e testes unitários com 100% de cobertura nos serviços, usando mocks do aws-sdk-client-mock.

3.  **Modelagem NoSQL (DynamoDB Single-Table Design):**
    - A maior mudança de paradigma foi sair da modelagem relacional ou de documentos do MongoDB para o Single-Table Design do DynamoDB.
    - Aprendi a focar em "Padrões de Acesso" antes de escrever qualquer código. Usar chaves compostas (PK/SK) como `USER#email` e `PRODUCTS` foi uma virada de chave para permitir buscas diretas (Query) em vez de varrer a tabela inteira (Scan), o que entendi ser um anti-padrão de performance.

4.  **IAM e CloudWatch:**
    - O ponto de inflexão do projeto foi o deploy. Localmente, tudo funcionava, mas na AWS recebi um `500 Internal Server Error`.
    - O aprendizado real foi mergulhar no CloudWatch e encontrar o log da `AccessDeniedException`. Ali entendi a diferença crucial entre as credenciais do meu usuário (que o CLI usa) e a Role de Execução (que a Lambda assume na nuvem).
    - Resolver isso diretamente no `serverless.yml` conectou os pontos de como a Infraestrutura como Código (IaC) gerencia permissões de forma declarativa.
