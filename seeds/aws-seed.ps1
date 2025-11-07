#!/usr/bin/env pwsh
# ========================================
# Script de Seed para DynamoDB AWS (Windows/PowerShell) - CORRIGIDO
# ========================================

$TABLE_NAME = "ton-marketplace-api-dev"
$REGION = "us-east-1"
$PROFILEAWS = "ton-deploy"

Write-Host ""
Write-Host "Iniciando seed do DynamoDB na AWS..." -ForegroundColor Cyan
Write-Host "Tabela: $TABLE_NAME" -ForegroundColor Yellow
Write-Host "Regiao: $REGION" -ForegroundColor Yellow
Write-Host "Profile: $PROFILEAWS" -ForegroundColor Yellow
Write-Host ""

# ========================================
# 1. VERIFICAR CREDENCIAIS AWS
# ========================================
Write-Host "Verificando credenciais AWS..." -ForegroundColor Cyan
try {
    $null = aws sts get-caller-identity --profile $PROFILEAWS 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Credenciais validadas!" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "Erro de autenticacao"
    }
} catch {
    Write-Host "Erro: Credenciais AWS invalidas para o profile '$PROFILEAWS'" -ForegroundColor Red
    Write-Host "Execute: aws configure --profile $PROFILEAWS" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ========================================
# 2. VERIFICAR SE A TABELA EXISTE
# ========================================
Write-Host "Verificando se a tabela existe na AWS..." -ForegroundColor Cyan
$tableExists = aws dynamodb describe-table `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Tabela '$TABLE_NAME' encontrada!" -ForegroundColor Green
    Write-Host ""
    
    $response = Read-Host "Deseja LIMPAR todos os dados existentes antes de inserir? (S/n)"
    
    if ($response -ne 'n' -and $response -ne 'N') {
        Write-Host "Limpando dados existentes..." -ForegroundColor Yellow
        
        # Escanear todos os itens
        $scanResult = aws dynamodb scan `
            --table-name $TABLE_NAME `
            --region $REGION `
            --profile $PROFILEAWS `
            --attributes-to-get PK SK | ConvertFrom-Json
        
        # Deletar cada item
        $itemCount = $scanResult.Items.Count
        if ($itemCount -gt 0) {
            Write-Host "Deletando $itemCount itens existentes..." -ForegroundColor Yellow
            
            foreach ($item in $scanResult.Items) {
                aws dynamodb delete-item `
                    --table-name $TABLE_NAME `
                    --region $REGION `
                    --profile $PROFILEAWS `
                    --key '{\"PK\": {\"S\": \"$($item.PK.S)\"}, \"SK\": {\"S\": \"$($item.SK.S)\"}}' | Out-Null
            }
            
            Write-Host "Dados limpos com sucesso!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "Tabela ja esta vazia." -ForegroundColor Yellow
            Write-Host ""
        }
    }
} else {
    Write-Host "ERRO: Tabela '$TABLE_NAME' nao encontrada na AWS!" -ForegroundColor Red
    Write-Host "A tabela deve ser criada pelo Serverless Framework durante o deploy." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ========================================
# 3. INSERIR PRODUTOS (CORRIGIDO)
# ========================================
Write-Host "Inserindo produtos..." -ForegroundColor Cyan

# Produto 1
Write-Host "  -> Maquina de Cartao T1..." -ForegroundColor Gray
aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --item '{\"PK\": {\"S\": \"PRODUCTS\"},\"SK\": {\"S\": \"PRODUCT#01\"},\"name\": {\"S\": \"Maquina de Cartao T1\"},\"description\": {\"S\": \"A maquina de entrada, perfeita para comecar.\"},\"price\": {\"N\": \"11880\"},\"category\": {\"S\": \"maquinas\"}}' | Out-Null

# Produto 2
Write-Host "  -> Maquina de Cartao T2+..." -ForegroundColor Gray
aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --item '{\"PK\": {\"S\": \"PRODUCTS\"},\"SK\": {\"S\": \"PRODUCT#02\"},\"name\": {\"S\": \"Maquina de Cartao T2+\"},\"description\": {\"S\": \"Mais bateria e comprovante impresso.\"},\"price\": {\"N\": \"23880\"},\"category\": {\"S\": \"maquinas\"}}' | Out-Null

# Produto 3
Write-Host "  -> Bobina T2 (Pacote com 12)..." -ForegroundColor Gray
aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --item '{\"PK\": {\"S\": \"PRODUCTS\"},\"SK\": {\"S\": \"PRODUCT#03\"},\"name\": {\"S\": \"Bobina T2 (Pacote com 12)\"},\"description\": {\"S\": \"Pacote de recarga de bobinas.\"},\"price\": {\"N\": \"5000\"},\"category\": {\"S\": \"insumos\"}}' | Out-Null

# Produto 4
Write-Host "  -> Capa Protetora T2..." -ForegroundColor Gray
aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --item '{\"PK\": {\"S\": \"PRODUCTS\"},\"SK\": {\"S\": \"PRODUCT#04\"},\"name\": {\"S\": \"Capa Protetora T2\"},\"description\": {\"S\": \"Protecao contra quedas e arranhoes.\"},\"price\": {\"N\": \"3990\"},\"category\": {\"S\": \"acessorios\"}}' | Out-Null

# Produto 5
Write-Host "  -> Maquina de Cartao T3 Pro..." -ForegroundColor Gray
aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --item '{\"PK\": {\"S\": \"PRODUCTS\"},\"SK\": {\"S\": \"PRODUCT#05\"},\"name\": {\"S\": \"Maquina de Cartao T3 Pro\"},\"description\": {\"S\": \"Top de linha com NFC e Wi-Fi integrado.\"},\"price\": {\"N\": \"39900\"},\"category\": {\"S\": \"maquinas\"}}' | Out-Null

Write-Host "Produtos inseridos com sucesso!" -ForegroundColor Green
Write-Host ""

# ========================================
# 4. INSERIR USUARIO DE TESTE (CORRIGIDO)
# ========================================
Write-Host "Inserindo usuario de teste..." -ForegroundColor Cyan

# Senha: senha123

aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --item '{\"PK\": {\"S\": \"USER#teste@ton.com\"},\"SK\": {\"S\": \"METADATA\"},\"name\": {\"S\": \"Usuario de Teste\"},\"email\": {\"S\": \"teste@ton.com\"},\"passwordHash\": {\"S\": \"$2b$10$dlWbsFIAo1nSwHhDatba7eCv6..7I1bXucHoEx9ZRbl.rtPZfEbqS\"},\"role\": {\"S\": \"seller\"}}' | Out-Null

Write-Host "Usuario inserido com sucesso!" -ForegroundColor Green
Write-Host ""

# ========================================
# 5. VERIFICAR DADOS INSERIDOS
# ========================================
Write-Host "Verificando dados inseridos..." -ForegroundColor Cyan
$scanResult = aws dynamodb scan `
    --table-name $TABLE_NAME `
    --region $REGION `
    --profile $PROFILEAWS `
    --select COUNT | ConvertFrom-Json

Write-Host "Total de itens na tabela: " -ForegroundColor Green -NoNewline
Write-Host "$($scanResult.Count)" -ForegroundColor Yellow

# ========================================
# RESUMO (Igual ao seu)
# ...