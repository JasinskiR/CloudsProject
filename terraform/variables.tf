variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  default = "10.0.1.0/24"
}

variable "region" {
  default = "us-east-1"
}

variable "frontend_docker_image" {
  description = "Docker image URI for the frontend application"
  default     = "814842473829.dkr.ecr.us-east-1.amazonaws.com/clouds_project:frontend_tf_v2"
}

variable "backend_docker_image" {
  description = "Docker image URI for the backend application"
  default     = "814842473829.dkr.ecr.us-east-1.amazonaws.com/clouds_project:backend_tf"
}
