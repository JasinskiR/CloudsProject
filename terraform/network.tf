variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "ID of the existing VPC"
  type        = string
  default     = "vpc-0a5f05330dc2ace4b"
}

provider "aws" {
  region = var.aws_region
}

variable "backend_subnet_id" {
  description = "ID of the existing backend subnet in us-east-1f"
  type        = string
  default     = "subnet-0f6b999b15c270072"
}

variable "public_subnet_id" {
  description = "ID of the existing backend subnet in us-east-1f"
  type        = string
  default     = "subnet-0f6b999b15c270072"
}

resource "aws_security_group" "frontend_tf" {
  name_prefix = "frontend-sg"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "backend_tf" {
  name_prefix = "backend-sg"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.2.0/24"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "frontend_sg_id" {
  value = aws_security_group.frontend_tf.id
}

output "backend_sg_id" {
  value = aws_security_group.backend_tf.id
}
