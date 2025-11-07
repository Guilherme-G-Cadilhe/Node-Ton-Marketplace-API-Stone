# Este arquivo é uma PROVA DE CONCEITO de como a infraestrutura
# seria provisionada usando Terraform (stack principal da Stone).

variable "aws_region" {
  description = "Região da AWS para o deploy"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "Perfil AWS CLI para autenticação"
  type        = string
  default     = "ton-deploy"
}

variable "table_name" {
  description = "Nome da tabela DynamoDB"
  type        = string
  default     = "ton-marketplace-api-dev"
}