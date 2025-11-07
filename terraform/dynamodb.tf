# Este arquivo é uma PROVA DE CONCEITO de como a infraestrutura
# seria provisionada usando Terraform (stack principal da Stone).

resource "aws_dynamodb_table" "marketplace_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  # Chave de Partição (PK)
  hash_key = "PK"
  
  # Chave de Ordenação (SK)
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S" # S = String
  }

  attribute {
    name = "SK"
    type = "S"
  }

  tags = {
    Project     = "Ton Marketplace API"
    Environment = "dev"
  }
}