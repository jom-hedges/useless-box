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
    region = "ap-northeast-1"
}

resource "aws_vpc" "rabbit-vpc-public" {
    cidr_block              = "10.0.0.0/16"
    enable_dns_support      = true
    enable_dns_hostnames    = true
    
    tags = {
        Name = "rabbit-main-public"
    }
}

resource "aws_internet_gateway" "rabbit-gateway" {
    vpc_id = aws_vpc.rabbit-vpc-public.id
}

resource "aws_subnet" "rabbit-vpc-public" {
    vpc_id              = aws_vpc.rabbit-vpc-public.id
    cidr_block          = "10.0.1.0/24"
    availability_zone   = "ap-northeast-1a"

    tags = {
        Name = "rabbit-main-public"
    }
}

resource "aws_route_table" "rabbit-route-table" {
    vpc_id = aws_vpc.rabbit-vpc-public.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.rabbit-gateway.id
    }

    tags = {
        "rabbit-public-route-table"
    }
}

resource "aws_route_table_association" "rabbit-association" {
    subnet_id       = aws_subnet.rabbit-vpc-public.id
    route_table_id  = aws_route_table.rabbit-route-table.id
}

resource "aws_security_group" "rabbit-security-group" {
    name = "rabbit-ssh-security"
    vpc_id = aws_vpc.rabbit-vpc-public.id

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

data "aws_ami" "ubuntu" { 
    most_recent = true

    filter {
        name = "name"
        values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
    }

    owners = ["099720109477"] # Canonical
}

resource "aws_instance" "rabbit-env-server" {
    ami                         = data.aws_ami.ubuntu.id
    instance_type               = "t3.micro"
    associate_public_ip_address = true
    key_name                    = "greg-rabbit-key"
    vpc_security_group_ids      = [aws_security_group.rabbit-security-group.id]
    subnet_id                   = aws_subnet.rabbit-vpc-public.id

    tags = {
        Name = "rabbit-env-server"
    }
}

resource "aws_dynamodb_table" "useless-box-state" {
  name         = "useless-box-state"
  billing_mode = "ON_DEMAND"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
