# MakrX Ecosystem Installation Guide

This guide provides detailed instructions for setting up the MakrX ecosystem on different platforms.

## 📋 System Requirements

**IMPORTANT:** All Python backends require **Python 3.12**. Do NOT use Python 3.13 or higher for venvs or backend servers.

### Minimum Requirements

- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: 4 cores (8 cores recommended)

### Required Software

- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **Docker** 20.0+ & Docker Compose ([Download](https://docs.docker.com/get-docker/))
- **Git** 2.30+ ([Download](https://git-scm.com/))

### Optional Software

- **VS Code** with recommended extensions ([Download](https://code.visualstudio.com/))
- **Postman** for API testing ([Download](https://www.postman.com/))

## 🚀 Quick Installation

### Option 1: Automated Setup (Recommended)

#### For Unix/Linux/macOS:

```bash
git clone https://github.com/your-org/makrx-ecosystem-unified.git
cd makrx-ecosystem-unified
chmod +x scripts/unix/setup.sh
./scripts/unix/setup.sh

# (NEW) Set up Python 3.12 virtual environments and install backend dependencies
for d in backends/makrcave backends/makrx-store backends/makrx_events; do
  cd $d
  python3.12 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
  deactivate
  cd -
done
```

#### For Windows:

```cmd
git clone https://github.com/your-org/makrx-ecosystem-unified.git
cd makrx-ecosystem-unified
scripts\windows\setup.bat

REM (NEW) Set up Python virtual environments and install backend dependencies
FOR %%d IN (backends\makrcave backends\makrx-store backends\makrx_events) DO (
  cd %%d
  python -m venv venv
  call venv\Scripts\activate
  pip install --upgrade pip
  pip install -r requirements.txt
  deactivate
  cd ..\..
)
```

### Option 2: Manual Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/makrx-ecosystem-unified.git
cd makrx-ecosystem-unified
```

#### Step 2: Install Dependencies

```bash
npm ci --legacy-peer-deps

# (NEW) Set up Python 3.12 virtual environments and install backend dependencies
for d in backends/makrcave backends/makrx-store backends/makrx_events; do
  cd $d
  python3.12 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
  deactivate
  cd -
done
```

#### Step 3: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Create app-specific environment files
cp apps/gateway-frontend/.env.example apps/gateway-frontend/.env.local
cp apps/gateway-frontend-hacker/.env.example apps/gateway-frontend-hacker/.env.local
cp apps/makrcave/.env.example apps/makrcave/.env.local
cp apps/makrx-store/.env.example apps/makrx-store/.env.local
cp apps/makrx-events/.env.example apps/makrx-events/.env.local
```

#### Step 4: Configure Environment Variables

Edit the `.env` file with your configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem
REDIS_URL=redis://localhost:6380

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=makrx
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Application Configuration
NODE_ENV=development
```

Edit each app's `.env.local` file:

```bash
# Gateway Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=gateway-frontend

# MakrCave (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrcave
```

#### Step 5: Start Infrastructure Services

```bash
docker-compose up -d postgres redis keycloak minio
```

#### Step 6: Wait for Services to Start

```bash
# Check service status
docker-compose ps

# Wait for Keycloak to be ready (may take 2-3 minutes)
docker-compose logs -f keycloak
```

#### Step 7: Initialize Database

```bash
# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed

# (If you see 'alembic: not found', 'python: not found', or 'No module named uvicorn', ensure you have activated the correct Python 3.12 virtual environment in each backend directory.)
```

#### Step 8: Start Development Servers

```bash
npm run dev
```

This will start all infrastructure, frontend, and backend servers. No need to manually activate venvs for development: the script now does it for you.

## 🔧 Platform-Specific Instructions

### Windows Installation

#### Prerequisites for Windows:

1. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **Install Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop)
3. **Install Git**: Download from [git-scm.com](https://git-scm.com/)

#### Windows-Specific Setup:

```cmd
# Enable long paths (run as Administrator)
git config --system core.longpaths true

# Set npm cache location (optional)
npm config set cache C:\npm-cache --global

# Use Windows script
scripts\windows\setup.bat
```

#### Windows Troubleshooting:

- **Port conflicts**: Use `netstat -ano | findstr :3000` to check port usage
- **Permission issues**: Run PowerShell/CMD as Administrator
- **Docker issues**: Ensure Docker Desktop is running and WSL2 is enabled

### macOS Installation

#### Prerequisites for macOS:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Docker Desktop
brew install --cask docker

# Install Git (usually pre-installed)
brew install git
```

#### macOS-Specific Setup:

```bash
# Ensure proper permissions
sudo chown -R $(whoami) ~/.npm

# Run setup script
chmod +x scripts/unix/setup.sh
./scripts/unix/setup.sh
```

### Ubuntu/Debian Installation

#### Prerequisites for Ubuntu/Debian:

```bash
# Update package index
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Install Git
sudo apt-get install -y git

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Ubuntu-Specific Setup:

```bash
# Run setup script
chmod +x scripts/unix/setup.sh
./scripts/unix/setup.sh
```

### CentOS/RHEL Installation

#### Prerequisites for CentOS/RHEL:

```bash
# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Docker
sudo yum install -y docker docker-compose

# Install Git
sudo yum install -y git

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## 🐳 Docker-Only Installation

If you prefer to run everything in Docker:

```bash
# Clone repository
git clone https://github.com/your-org/makrx-ecosystem-unified.git
cd makrx-ecosystem-unified

# Start everything with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🧪 Verify Installation

### Check All Services:

```bash
# Check infrastructure services
curl http://localhost:8081/auth/realms/makrx  # Keycloak
curl http://localhost:9002/minio/health/ready  # MinIO

# Check applications
curl http://localhost:3000  # Gateway Frontend
curl http://localhost:3002  # MakrCave
curl http://localhost:8001/health  # MakrCave API
```

### Run Tests:

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
```

### Check Development Environment:

```bash
# List running services
docker-compose ps

# Check application logs
npm run dev
```

## 🛠️ IDE Setup

### VS Code Setup

Install recommended extensions:

```bash
# Install VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
```

### Workspace Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.workingDirectories": ["apps/*", "packages/*"],
  "python.defaultInterpreterPath": "./backends/*/venv/bin/python"
}
```

## 🔍 Troubleshooting

### Common Issues:

#### Port Already in Use:

```bash
# Find process using port
lsof -i :3000  # Unix/macOS
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Unix/macOS
taskkill /PID <PID> /F  # Windows
```

#### Docker Issues:

```bash
# Reset Docker
docker-compose down -v
docker system prune -a
docker-compose up -d
```

#### Node.js Issues:

```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall dependencies
rm -rf node_modules package-lock.json
npm ci --legacy-peer-deps
```

#### Permission Issues (Unix):

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ./node_modules
```

### Getting Help:

1. **Check logs**: `docker-compose logs <service-name>`
2. **Restart services**: `docker-compose restart`
3. **Check system resources**: Ensure sufficient RAM/disk space
4. **Review environment variables**: Verify all required variables are set
5. **Check firewall**: Ensure ports are not blocked

### Performance Optimization:

#### For Development:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Use faster package manager
npm install -g pnpm
pnpm install  # Instead of npm ci
```

#### For Docker:

```bash
# Allocate more resources to Docker Desktop
# - Memory: 8GB minimum
# - CPU: 4 cores minimum
# - Disk: 50GB minimum
```

## ✅ Next Steps

After successful installation:

1. **Configure Keycloak**: Set up realms and clients
2. **Initialize data**: Run database seeds and migrations
3. **Test applications**: Visit each application URL
4. **Read documentation**: Review API docs and architecture
5. **Start developing**: Create your first feature!

## 📚 Additional Resources

- [Development Guide](docs/DEVELOPMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

**Need help?** Open an issue on [GitHub](../../issues) or check our [discussions](../../discussions).
