terraform {
    required_providers {
      aws = {
        source = "hashicorp/aws"
        version = "~> 5.92"
      }
    }

    required_version = ">= 1.5.0"
}

provider "aws" {
    region = "us-east-2"
}

data "aws_ami" "ubuntu" {
    most_recent = true

    filter {
        name = "name"
        values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
    }

    owners = ["099720109477"] # Canonical
}

resource "aws_instance" "rabbit-env-server" {
    ami           = data.aws_ami.ubuntu.id
    instance_type = "t3.micro"

    tags = {
        Name = "rabbit-env-server"
    }
}