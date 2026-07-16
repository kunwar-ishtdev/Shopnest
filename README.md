# ShopNest – Cloud-Native E-Commerce Platform

A production-ready, microservices-based e-commerce platform built with modern DevOps practices.

## Architecture Overview

```
shopnest/
 ┣ frontend/              # React.js + Tailwind CSS + Redux
 ┣ api-gateway/           # Express.js API Gateway
 ┣ user-service/          # Auth, Profiles, Addresses
 ┣ product-service/       # Catalog, Inventory, Reviews
 ┣ order-service/         # Orders, Tracking, History
 ┣ payment-service/       # Payments, Refunds
 ┣ notification-service/  # Email, SMS Notifications
 ┣ terraform/             # AWS Infrastructure as Code
 ┣ kubernetes/            # K8s Manifests
 ┣ jenkins/               # CI/CD Pipelines
 ┣ monitoring/            # Prometheus + Grafana
 ┣ docker-compose.yml
 ┗ README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js (Microservices) |
| Databases | MongoDB, PostgreSQL |
| Security | JWT, BCrypt, RBAC |
| Container | Docker, Docker Compose |
| Orchestration | Kubernetes (EKS) |
| IaC | Terraform |
| CI/CD | Jenkins |
| Monitoring | Prometheus, Grafana |
| Cloud | AWS (EC2, EKS, RDS, S3, ECR) |
| Message Broker | RabbitMQ |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- AWS CLI (for cloud deployment)
- kubectl (for Kubernetes)
- Terraform (for infrastructure)

### Local Development

```bash
# Clone the repo
git clone https://github.com/your-org/shopnest.git
cd shopnest

# Copy environment files
cp .env.example .env

# Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
# User Service: http://localhost:3001
# Product Service: http://localhost:3002
# Order Service: http://localhost:3003
# Payment Service: http://localhost:3004
# Notification Service: http://localhost:3005
# RabbitMQ Management: http://localhost:15672
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3006
```

### Environment Variables

Create `.env` file in root:
```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# MongoDB
MONGO_URI=mongodb://mongo:27017/shopnest

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=shopnest
POSTGRES_USER=shopnest
POSTGRES_PASSWORD=shopnest_password

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# AWS (for production)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id
ECR_REGISTRY=your-ecr-registry

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## API Documentation

Swagger UI available at:
- API Gateway: http://localhost:8080/api-docs
- User Service: http://localhost:3001/api-docs
- Product Service: http://localhost:3002/api-docs
- Order Service: http://localhost:3003/api-docs
- Payment Service: http://localhost:3004/api-docs

## Deployment

### AWS Deployment

```bash
# 1. Provision infrastructure
cd terraform
terraform init
terraform plan
terraform apply

# 2. Build and push Docker images
cd ../jenkins
# Run Jenkins pipeline or manually:
docker build -t shopnest-frontend ./frontend
docker tag shopnest-frontend:latest $ECR_REGISTRY/shopnest-frontend:latest
docker push $ECR_REGISTRY/shopnest-frontend:latest

# 3. Deploy to Kubernetes
kubectl apply -f kubernetes/
```

## Monitoring

- Prometheus: Metrics collection from all services
- Grafana: Visualization dashboards
- Default Grafana credentials: admin/admin

## Author

- **Student**: Kunwar Isht Dev Pratap Singh
- **Course**: INT 377 - Cloud Computing and DevOps Essentials
- **Section**: 323YB | **Roll No**: 47