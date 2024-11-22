resource "aws_instance" "frontend_tf" {
  ami           = "ami-0866a3c8686eaeeba"
  instance_type = "t2.micro"
  subnet_id     = var.public_subnet_id  # Use the existing public subnet ID variable
  vpc_security_group_ids = [aws_security_group.frontend_tf.id]
  iam_instance_profile = "LabInstanceProfile"

    user_data = <<-EOF
                #!/bin/bash
                # Update and install required packages
                apt update -y
                apt install -y docker.io
                sudo snap install aws-cli --classic
                
                # Start and enable Docker
                systemctl start docker
                systemctl enable docker
                sudo usermod -aG docker ubuntu
                
                # Configure AWS CLI for Docker authentication
                $(aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 814842473829.dkr.ecr.us-east-1.amazonaws.com)
                
                # Set environment variables for the application
                echo "REACT_APP_SERVER_URL=http://${aws_instance.backend_tf.public_ip}:4000" > /home/ubuntu/.env
                
                # Pull and run the Docker container
                sudo docker pull 814842473829.dkr.ecr.us-east-1.amazonaws.com/clouds_project:frontend_tf_v2
                sudo docker run -e REACT_APP_SERVER_URL=http://${aws_instance.backend_tf.public_ip}:4000 -p 80:80 814842473829.dkr.ecr.us-east-1.amazonaws.com/clouds_project:frontend_tf_v2
              EOF

  tags = {
    Name = "frontend-instance"
  }
    depends_on = [aws_instance.backend_tf] # Ensures backend is provisioned first
}

resource "aws_eip" "frontend_eip" {
  instance = aws_instance.frontend_tf.id
}

variable "backend_secrets" {
  description = "Secrets to rds database"
  type        = string
  sensitive   = true
}

resource "aws_instance" "backend_tf" {
  ami           = "ami-0866a3c8686eaeeba"
  instance_type = "t2.micro"
  subnet_id     = var.backend_subnet_id  # Ensure the correct backend subnet is referenced
  vpc_security_group_ids = [
    aws_security_group.backend_tf.id, # Existing Terraform-managed SG
    "sg-00a0ff6e37ebd020f",            # Pre-existing SG
    "sg-024f30b59440f00ba",            # Additional pre-existing SG
    "sg-0c4c6828dab15052c"             # Newly added SG
  ]
  iam_instance_profile = "LabInstanceProfile"

  user_data = <<-EOF
                #!/bin/bash
                apt update -y
                apt install -y docker.io
                sudo snap install aws-cli --classic
                $(aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 814842473829.dkr.ecr.us-east-1.amazonaws.com)
                systemctl start docker
                systemctl enable docker
                sudo usermod -aG docker ubuntu
                sudo echo '${var.backend_secrets}' > /home/ubuntu/.env
                sudo docker pull ${var.backend_docker_image}
                sudo docker run --env-file /home/ubuntu/.env -p 4000:4000 ${var.backend_docker_image}
              EOF

  tags = {
    Name = "backend-instance"
  }
}


output "frontend_instance_ip" {
  value = aws_instance.frontend_tf.public_ip
}

output "backend_instance_ip" {
  value = aws_instance.backend_tf.private_ip
}
