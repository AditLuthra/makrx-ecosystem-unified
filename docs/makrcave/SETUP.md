# MakrCave Development Setup

This document provides step-by-step instructions for setting up MakrCave in development mode.

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+
- **Git**

## Quick Start

1. **Clone and setup environment**

```bash
git clone <repository-url>
cd MakrCave-AI-main

# Make scripts executable
chmod +x start.sh stop.sh cleanup_vite.sh

# Clean up Vite configuration conflicts
./scripts/cleanup_vite.sh
```

2. **Start the application**

```bash
./scripts/start.sh
```

This will:

- Copy environment template files
- Create Python virtual environment
- Install all dependencies
- Start both frontend (port 5000) and backend (port 8000)

3. **Access the application**

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

4. **Stop the application**

```bash
./scripts/stop.sh
```

## Manual Setup (Alternative)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start backend
python start.py
```

### Frontend Setup

```bash
# In project root
npm install

# Copy environment file
cp .env.example .env

# Start frontend
npm run dev
```

## Environment Configuration

### Backend (.env)

Key settings for development:

```env
ENVIRONMENT=development
DATABASE_URL=sqlite:///./makrcave.db
SECRET_KEY=your-secret-key-here
DEBUG=true
```

### Frontend (.env)

Key settings for development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

## Architecture Changes Made

### 🔧 Critical Fixes Applied

1. **Removed Vite Configuration** - Standardized on Next.js only
2. **Fixed Docker Configuration** - Updated for Next.js standalone build
3. **Updated Port Configuration** - Consistent 5000 (frontend) and 8000 (backend)
4. **Created Startup Scripts** - Automated development environment setup
5. **Fixed CORS Configuration** - Proper development origins
6. **Updated Dependencies** - Matched backend pyproject.toml versions

### 📁 File Structure

```
MakrCave-AI-main/
├── app/                    # Next.js App Router pages
├── backend/               # FastAPI backend
├── components/           # React components
├── contexts/            # React contexts
├── public/              # Static assets
├── start.sh            # Development startup script
├── stop.sh             # Stop all services script
└── VITE_BACKUP_REMOVED/ # Archived Vite files
```

### 🚀 Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: FastAPI with Python 3.11+
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Styling**: Tailwind CSS + Radix UI
- **Authentication**: Keycloak SSO

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5000
lsof -i :8000

# Kill processes if needed
./scripts/stop.sh
```

### Python Environment Issues

```bash
cd backend
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Node Dependencies Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

```bash
cd backend
rm -f makrcave.db  # Reset SQLite database
python init_db.py  # Reinitialize database
```

## Development Workflow

1. **Start development**: `./scripts/start.sh`
2. **Make changes** to frontend or backend code
3. **Hot reload** is enabled for both services
4. **Stop development**: `./scripts/stop.sh` or Ctrl+C

## Production Deployment

See [Dockerfile](./Dockerfile) for containerized deployment or refer to the main README for deployment instructions.

## Support

- Check application health: http://localhost:8000/health
- View API documentation: http://localhost:8000/docs
- Check logs in terminal output
- For issues, see the main README troubleshooting section
