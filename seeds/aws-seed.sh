#!/bin/bash
# ========================================
# Script de Seed para DynamoDB AWS (Bash/Linux/Mac/WSL)
# ========================================
# Como usar: ./aws-seed.sh
# ========================================

TABLE_NAME="ton-marketplace-api-dev"
REGION="us-east-1"
PROFILE="ton-deploy"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}🚀 Iniciando seed do DynamoDB na AWS...${NC}"
echo -e "${YELLOW}📦 Tabela: ${TABLE_NAME}${NC}"
echo -e "${YELLOW}🌎 Região: ${REGION}${NC}"
echo -e "${YELLOW}👤 Profile: ${PROFILE}\n${NC}"

# ========================================
# 1. VERIFICAR CREDENCIAIS AWS
# ========================================
echo -e "${CYAN}🔍 Verificando credenciais AWS...${NC}"
if aws sts get-caller-identity --profile ${PROFILE} &> /dev/null; then
    echo -e "${GREEN}✅ Credenciais validadas!\n${NC}"
else
    echo -e "${RED}❌ Erro: Credenciais AWS inválidas para o profile '${PROFILE}'${NC}"
    echo -e "${YELLOW}💡 Execute: aws configure --profile ${PROFILE}\n${NC}"
    exit 1
fi

# ========================================
# 2. VERIFICAR SE A TABELA EXISTE
# ========================================
echo -e "${CYAN}🔍 Verificando se a tabela existe na AWS...${NC}"
if aws dynamodb describe-table \
    --table-name ${TABLE_NAME} \
    --region ${REGION} \
    --profile ${PROFILE} &> /dev/null; then
    
    echo -e "${GREEN}✅ Tabela '${TABLE_NAME}' encontrada!\n${NC}"
    
    read -p "Deseja LIMPAR todos os dados existentes antes de inserir? (S/n): " response
    
    if [[ ! "$response" =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}🧹 Limpando dados existentes...${NC}"
        
        # Escanear todos os itens
        ITEMS=$(aws dynamodb scan \
            --table-name ${TABLE_NAME} \
            --region ${REGION} \
            --profile ${PROFILE} \
            --attributes-to-get PK SK \
            --output json)
        
        # Contar itens
        ITEM_COUNT=$(echo $ITEMS | jq '.Items | length')
        
        if [ "$ITEM_COUNT" -gt 0 ]; then
            echo -e "${YELLOW}🗑️  Deletando ${ITEM_COUNT} itens existentes...${NC}"
            
            # Deletar cada item
            echo $ITEMS | jq -c '.Items[]' | while read item; do
                PK=$(echo $item | jq -r '.PK.S')
                SK=$(echo $item | jq -r '.SK.S')
                
                aws dynamodb delete-item \
                    --table-name ${TABLE_NAME} \
                    --region ${REGION} \
                    --profile ${PROFILE} \
                    --key "{\"PK\": {\"S\": \"${PK}\"}, \"SK\": {\"S\": \"${SK}\"}}" > /dev/null
            done
            
            echo -e "${GREEN}✅ Dados limpos com sucesso!\n${NC}"
        else
            echo -e "${YELLOW}⚠️  Tabela já está vazia.\n${NC}"
        fi
    fi
else
    echo -e "${RED}❌ ERRO: Tabela '${TABLE_NAME}' não encontrada na AWS!${NC}"
    echo -e "${YELLOW}💡 A tabela deve ser criada pelo Serverless Framework durante o deploy.\n${NC}"
    exit 1
fi

# ========================================
# 3. INSERIR PRODUTOS
# ========================================
echo -e "${CYAN}📦 Inserindo produtos...${NC}"

# Produto 1
echo -e "${GRAY}  → Máquina de Cartão T1...${NC}"
aws dynamodb put-item \
  --table-name ${TABLE_NAME} \
  --region ${REGION} \
  --profile ${PROFILE} \
  --item '{
    "PK": {"S": "PRODUCTS"},
    "SK": {"S": "PRODUCT#01"},
    "name": {"S": "Máquina de Cartão T1"},
    "description": {"S": "A máquina de entrada, perfeita para começar."},
    "price": {"N": "11880"},
    "category": {"S": "maquinas"}
  }' > /dev/null

# Produto 2
echo -e "${GRAY}  → Máquina de Cartão T2+...${NC}"
aws dynamodb put-item \
  --table-name ${TABLE_NAME} \
  --region ${REGION} \
  --profile ${PROFILE} \
  --item '{
    "PK": {"S": "PRODUCTS"},
    "SK": {"S": "PRODUCT#02"},
    "name": {"S": "Máquina de Cartão T2+"},
    "description": {"S": "Mais bateria e comprovante impresso."},
    "price": {"N": "23880"},
    "category": {"S": "maquinas"}
  }' > /dev/null

# Produto 3
echo -e "${GRAY}  → Bobina T2 (Pacote com 12)...${NC}"
aws dynamodb put-item \
  --table-name ${TABLE_NAME} \
  --region ${REGION} \
  --profile ${PROFILE} \
  --item '{
    "PK": {"S": "PRODUCTS"},
    "SK": {"S": "PRODUCT#03"},
    "name": {"S": "Bobina T2 (Pacote com 12)"},
    "description": {"S": "Pacote de recarga de bobinas."},
    "price": {"N": "5000"},
    "category": {"S": "insumos"}
  }' > /dev/null

# Produto 4
echo -e "${GRAY}  → Capa Protetora T2...${NC}"
aws dynamodb put-item \
  --table-name ${TABLE_NAME} \
  --region ${REGION} \
  --profile ${PROFILE} \
  --item '{
    "PK": {"S": "PRODUCTS"},
    "SK": {"S": "PRODUCT#04"},
    "name": {"S": "Capa Protetora T2"},
    "description": {"S": "Proteção contra quedas e arranhões."},
    "price": {"N": "3990"},
    "category": {"S": "acessorios"}
  }' > /dev/null

# Produto 5
echo -e "${GRAY}  → Máquina de Cartão T3 Pro...${NC}"
aws dynamodb put-item \
  --table-name ${TABLE_NAME} \
  --region ${REGION} \
  --profile ${PROFILE} \
  --item '{
    "PK": {"S": "PRODUCTS"},
    "SK": {"S": "PRODUCT#05"},
    "name": {"S": "Máquina de Cartão T3 Pro"},
    "description": {"S": "Top de linha com NFC e Wi-Fi integrado."},
    "price": {"N": "39900"},
    "category": {"S": "maquinas"}
  }' > /dev/null

echo -e "${GREEN}✅ Produtos inseridos com sucesso!\n${NC}"

# ========================================
# 4. INSERIR USUÁRIO DE TESTE
# ========================================
echo -e "${CYAN}👤 Inserindo usuário de teste...${NC}"

# Senha: senha123
PASSWORD_HASH='$2b$10$dlWbsFIAo1nSwHhDatba7eCv6..7I1bXucHoEx9ZRbl.rtPZfEbqS'

aws dynamodb put-item \
  --table-name ${TABLE_NAME} \
  --region ${REGION} \
  --profile ${PROFILE} \
  --item "{
    \"PK\": {\"S\": \"USER#teste@ton.com\"},
    \"SK\": {\"S\": \"METADATA\"},
    \"name\": {\"S\": \"Usuário de Teste\"},
    \"email\": {\"S\": \"teste@ton.com\"},
    \"passwordHash\": {\"S\": \"${PASSWORD_HASH}\"},
    \"role\": {\"S\": \"seller\"}
  }" > /dev/null

echo -e "${GREEN}✅ Usuário inserido com sucesso!\n${NC}"

# ========================================
# 5. VERIFICAR DADOS INSERIDOS
# ========================================
echo -e "${CYAN}🔍 Verificando dados inseridos...${NC}"
COUNT=$(aws dynamodb scan \
    --table-name ${TABLE_NAME} \
    --region ${REGION} \
    --profile ${PROFILE} \
    --select COUNT \
    --output json | jq -r '.Count')

echo -e "${GREEN}✅ Total de itens na tabela: ${YELLOW}${COUNT}${NC}"

# ========================================
# RESUMO
# ========================================
echo -e "\n${CYAN}==================================================${NC}"
echo -e "${GREEN}✨ Seed concluído com sucesso na AWS!${NC}"
echo -e "${CYAN}==================================================${NC}"
echo -e "\n${YELLOW}📊 Dados inseridos:${NC}"
echo -e "${WHITE}  • 5 Produtos (3 máquinas + 1 insumo + 1 acessório)${NC}"
echo -e "${WHITE}  • 1 Usuário de teste${NC}"
echo -e "\n${YELLOW}🔐 Credenciais de teste:${NC}"
echo -e "${WHITE}  Email: teste@ton.com${NC}"
echo -e "${WHITE}  Senha: Teste@123${NC}"
echo -e "\n${YELLOW}🌐 Endpoints da API:${NC}"
echo -e "${GRAY}  POST /auth/login  - Obter token JWT${NC}"
echo -e "${GRAY}  GET  /products    - Listar produtos (requer token)${NC}"
echo -e "\n${YELLOW}💡 Para visualizar os dados:${NC}"
echo -e "${GRAY}  aws dynamodb scan --table-name ${TABLE_NAME} --region ${REGION} --profile ${PROFILE}\n${NC}"
echo -e "${YELLOW}🧪 Para testar a API:${NC}"
echo -e "${GRAY}  1. Faça login: POST https://vwnbt8pifi.execute-api.us-east-1.amazonaws.com/auth/login${NC}"
echo -e "${GRAY}  2. Use o token retornado no header Authorization: Bearer <token>\n${NC}"