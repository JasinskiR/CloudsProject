output "frontend_ip" {
  value = aws_instance.frontend_tf.public_ip
}

output "backend_ip" {
  value = aws_instance.backend_tf.private_ip
}
