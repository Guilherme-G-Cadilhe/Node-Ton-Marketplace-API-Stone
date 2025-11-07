# Este arquivo é uma PROVA DE CONCEITO de como a infraestrutura
# seria provisionada usando Terraform (stack principal da Stone).

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.0"
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

resource "aws_dynamodb_table" "ton_marketplace" {
  name         = "ton-marketplace-api-dev" # (Em um deploy real, usaríamos var.env)
  billing_mode = "PAY_PER_REQUEST"

  # Nossa chave primária composta (Single-Table Design)
  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  tags = {
    Project     = "TonMarketplaceAPI"
    Environment = "dev"
    Owner       = "DesafioStone"
  }
}