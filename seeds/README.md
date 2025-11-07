# 🌱 Scripts de Seed - DynamoDB Local

Scripts para popular automaticamente a tabela do DynamoDB Local com dados de teste.

## 📁 Estrutura de Arquivos

```
/seeds
├── bash-seed-dynamodb.sh     # Script para Bash (Linux/Mac/WSL/VSCode Terminal)
├── windows-seed-dynamodb.ps1    # Script para PowerShell (Windows Terminal)
└── README.md            # Este arquivo
```

## 🚀 Como Usar

### 🪟 No Windows Terminal (PowerShell)

1. Abra o **Windows Terminal** ou **PowerShell**
2. Navegue até a pasta do projeto:
   ```powershell
   cd caminho/do/seu/projeto
   ```
3. Execute o script:
   ```powershell
   .\seeds\windows-seed-dynamodb.ps1
   ```

**Se der erro de política de execução:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 🐧 No Terminal Bash (Linux/Mac/WSL/VSCode)

1. Abra o **Terminal Bash** no VSCode ou seu terminal preferido
2. Dê permissão de execução ao script (apenas na primeira vez):
   ```bash
   chmod +x seeds/bash-seed-dynamodb.sh
   ```
3. Execute o script:
   ```bash
   ./seeds/bash-seed-dynamodb.sh
   ```

---

## ✅ Pré-requisitos

Antes de executar os scripts, certifique-se de que:

1. **DynamoDB Local está rodando** (via Docker):

   ```bash
   docker ps
   ```

   Deve mostrar um container com DynamoDB rodando na porta 8000.

2. **AWS CLI está instalado** e configurado:

   ```bash
   aws --version
   ```

   Se não estiver configurado, rode:

   ```bash
   aws configure
   ```

   Use valores dummy para ambiente local:
   - Access Key: `fake`
   - Secret Key: `fake`
   - Region: `us-east-1`
   - Output: `json`

---

## 📊 Dados Inseridos

Os scripts criam e populam a tabela com:

### Produtos (3 itens)

- **Máquina de Cartão T1** - R$ 118,80 (categoria: maquinas)
- **Máquina de Cartão T2+** - R$ 238,80 (categoria: maquinas)
- **Bobina T2 (Pacote com 12)** - R$ 50,00 (categoria: insumos)

### Usuário de Teste (1 item)

- **Email:** `teste@ton.com`
- **Senha:** `Teste@123`
- **Role:** `seller`

---

## 🔧 Funcionalidades dos Scripts

✅ Verifica se o DynamoDB Local está rodando  
✅ Detecta se a tabela já existe e pergunta se deseja recriar  
✅ Cria a tabela com os índices corretos  
✅ Insere produtos e usuário de teste  
✅ Exibe resumo colorido com contagem de itens  
✅ Mensagens de progresso em tempo real

---

## 🔍 Verificar os Dados

Após executar o seed, você pode verificar os dados inseridos:

```bash
# Listar todos os itens
aws dynamodb scan --table-name ton-marketplace-api-dev --endpoint-url http://localhost:8000

# Listar apenas produtos
aws dynamodb query \
  --table-name ton-marketplace-api-dev \
  --endpoint-url http://localhost:8000 \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk":{"S":"PRODUCTS"}}'

# Contar total de itens
aws dynamodb scan \
  --table-name ton-marketplace-api-dev \
  --endpoint-url http://localhost:8000 \
  --select COUNT
```

---

## 🗑️ Limpar os Dados

Para deletar a tabela e recomeçar:

```bash
aws dynamodb delete-table \
  --table-name ton-marketplace-api-dev \
  --endpoint-url http://localhost:8000
```

Depois é só rodar o script novamente!

---

## ⚠️ Troubleshooting

### Erro: "DynamoDB Local não está acessível"

- Verifique se o container Docker está rodando: `docker ps`
- Inicie o DynamoDB Local: `docker-compose up -d` (ou comando equivalente)

### Erro: "aws: command not found"

- Instale o AWS CLI: https://aws.amazon.com/cli/

### Erro: "Permission denied" (Bash)

- Dê permissão de execução: `chmod +x seeds/bash-seed-dynamodb.sh`

### Erro de política de execução (PowerShell)

- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 📝 Notas

- Os scripts são **idempotentes**: você pode executá-los múltiplas vezes
- Os preços estão em centavos (ex: 11880 = R$ 118,80)
- O hash da senha é válido para a senha `Teste@123`
- Scripts funcionam apenas com DynamoDB **Local** (não em produção)
