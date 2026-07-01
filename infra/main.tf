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

locals {
  azs = ["ap-northeast-1a", "ap-northeast-1b"]
}

resource "aws_subnet" "rabbit-vpc-public" {
    for_each = {
      "a" = { az = local.azs[0], cidr = "10.0.1.0/24" },
      "b" = { az = local.azs[1], cidr = "10.0.2.0/24" }
    }
    
    vpc_id            = aws_vpc.rabbit-vpc-public.id
    cidr_block        = each.value.cidr
    availability_zone = each.value.az

    tags = {
        Name = "public-${each.key}"
        Tier = "public"
    }
}

resource "aws_subnet" "rabbit-vpc-private" {
  for_each = {
    "a" = { az = local.azs[0], cidr = "10.0.10.0/24" },
    "b" = { az = local.azs[1], cidr = "10.0.11.0/24" }
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az
  
  tags = {
    Name = "private-${each.key}"
    Tier = "private"
  }
}

resource "aws_route_table" "public" {
   vpc_id = "aws_vpc.main.id"
  
   route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "aws_internet_gateway.main.id"
  }    

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table_association" "public" {
    for_each        = aws_subnet.public
    subnet_id       = each.value.id
    route_table_id  = aws_route_table.public.id
}

resource "aws_route" "private" {
  for_each  = aws_subnet.private
  vpc_id    = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    nat_gateway_id  = aws_nat_gateway.main[each.key].id
  }

  tags = {
    Name = "private-rt-${each.key}"
  }
}

resource "aws_route_table_association" "private" {
  field           = aws_subnet.private
  subnet_id       = each.value.id 
  route_table_id  = aws_route_table.private[each.key].id
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

resource "aws_dynamodb_table" "useless-box" {
  name         = "useless-box"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  tags = {
    Environment = "dev"
    Project     = "useless-box"
  }
}
