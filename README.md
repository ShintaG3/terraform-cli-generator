# Terraform CLI Generator

A powerful CLI tool for generating production-ready Terraform boilerplate configurations for AWS, Vercel, and Google Cloud Platform.

## Features

- 🚀 **Multi-Provider Support**: Generate configurations for AWS, Vercel, and GCP
- 🔧 **Interactive Configuration**: Easy setup for API keys and credentials
- 📝 **Production Ready**: Templates include security best practices
- 🎯 **Smart Defaults**: Uses configured regions and project settings
- 🔍 **Credential Detection**: Automatically detects existing CLI tools

## Installation

```bash
npm install -g terraform-cli-generator
```

## Quick Start

1. **Configure your providers:**
   ```bash
   tf config setup
   ```

2. **Generate resources:**
   ```bash
   # AWS Lambda function
   tf aws lambda -n my-function --runtime nodejs18.x
   
   # Vercel application
   tf vercel app -n my-app -d example.com
   
   # GCP storage bucket
   tf gcp storage -n my-bucket -r us-west1
   ```

## Supported Resources

### AWS
- **Lambda**: `tf aws lambda -n function-name --runtime nodejs18.x`
- **S3**: `tf aws s3 -n bucket-name`
- **EC2**: `tf aws ec2 -n instance-name`

### Vercel
- **App**: `tf vercel app -n app-name -d domain.com`
- **Domain**: `tf vercel domain -n domain-name -d domain.com`

### Google Cloud Platform
- **Storage**: `tf gcp storage -n bucket-name -r us-central1`
- **Cloud Function**: `tf gcp function -n function-name`
- **Compute Engine**: `tf gcp compute -n instance-name`

## Configuration Management

### Interactive Setup
```bash
# Setup all providers
tf config setup

# Setup specific provider
tf config setup --provider aws
tf config setup --provider vercel
tf config setup --provider gcp
```

### Manual Configuration
```bash
# Set individual values
tf config set aws.access_key_id AKIA...
tf config set aws.secret_access_key ...
tf config set aws.region us-west-2

tf config set vercel.api_token vercel_...
tf config set gcp.project_id my-project
```

### View Configuration
```bash
# Show all provider status
tf config status

# Get specific value
tf config get aws.region

# List all configuration
tf config list
```

## Authentication Methods

### AWS
- Access Keys (stored in `.tfrc`)
- AWS CLI profiles
- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)

### Vercel
- API Token (get from [Vercel Account Settings](https://vercel.com/account/tokens))
- Environment variable (`VERCEL_API_TOKEN`)

### Google Cloud Platform
- Service Account Key file
- gcloud CLI authentication
- Environment variables (`GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`)

## Examples

### AWS Lambda with API Gateway
```bash
tf aws lambda -n api-handler --runtime nodejs18.x --region us-east-1
```

### Vercel Next.js App with Custom Domain
```bash
tf vercel app -n my-nextjs-app -d myapp.com
```

### GCP Storage with Encryption
```bash
tf gcp storage -n secure-bucket -r us-central1
```

## Generated Templates Include

- ✅ Provider configuration
- ✅ Resource definitions with best practices
- ✅ IAM roles and security groups
- ✅ Encryption and security settings
- ✅ Output values for integration
- ✅ Proper naming conventions

## Development

```bash
# Clone repository
git clone https://github.com/shintanishino/terraform-cli-generator.git
cd terraform-cli-generator

# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev -- aws lambda -n test-function
```

## License

MIT

## Contributing

Pull requests are welcome! Please feel free to submit issues and enhancement requests.