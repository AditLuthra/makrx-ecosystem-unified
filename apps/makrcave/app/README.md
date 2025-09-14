# Development Guide

## Getting Started

### Prerequisites

- Node.js 20+ with npm
- Python 3.11+
- PostgreSQL 14+
- Redis (optional, for caching)
- Git

### Initial Setup

1. **Clone Repository**

```bash
git clone <repository-url>
cd makrcave
```

2. **Install Dependencies**

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

3. **Environment Configuration**

```bash
# Copy environment templates
cp .env.example .env.local
cp backend/.env.example backend/.env

# Edit configuration files
nano .env.local
nano backend/.env
```

4. **Database Setup**

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
createdb makrcave

# Initialize schema
cd backend
python init_db.py
```

5. **Start Development Servers**

```bash
# Terminal 1: Backend API (Port 8000)
cd backend
python start.py

# Terminal 2: Frontend (Port 5000)
npm run dev
```

## Development Workflow

### Branch Strategy

```
main                    # Production branch
├── develop            # Development integration
├── feature/xyz        # Feature branches
├── bugfix/abc         # Bug fix branches
└── hotfix/urgent      # Emergency fixes
```

### Code Standards

#### Frontend (TypeScript/React)

- **ESLint + Prettier** for code formatting
- **TypeScript strict mode** enabled
- **React best practices** with hooks and functional components
- **Tailwind CSS** for styling

#### Backend (Python/FastAPI)

- **Black + isort** for code formatting
- **Type hints** required for all functions
- **Pydantic models** for data validation
- **FastAPI** routing and dependency injection

### Git Workflow

1. **Create Feature Branch**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

2. **Make Changes**

```bash
# Make your changes
git add .
git commit -m "feat: add new feature functionality"
```

3. **Push and Create PR**

```bash
git push origin feature/new-feature
# Create Pull Request on GitHub
```

## Code Quality

### Linting and Formatting

#### Frontend

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run typecheck
```

#### Backend

```bash
cd backend

# Format code
black .
isort .

# Type checking
mypy .

# Run linter
flake8 .
```

### Testing

#### Frontend Testing

```bash
# Unit tests with Jest
npm run test

# E2E tests with Playwright
npm run test:e2e

# Test coverage
npm run test:coverage
```

#### Backend Testing

```bash
cd backend

# Unit tests
pytest tests/

# With coverage
pytest --cov=. tests/

# Integration tests
pytest tests/integration/
```

## Database Management

### Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Database Reset

```bash
cd backend

# Reset database (development only)
python init_db.py --reset

# Seed with sample data
python init_db.py --seed
```

## API Development

### Creating New Endpoints

1. **Define Pydantic Schema**

```python
# backend/schemas/new_entity.py
from pydantic import BaseModel

class NewEntityCreate(BaseModel):
    name: str
    description: str

class NewEntityResponse(BaseModel):
    id: str
    name: str
    description: str
    created_at: datetime
```

2. **Create Database Model**

```python
# backend/models/new_entity.py
from sqlalchemy import Column, String, DateTime
from .base import Base

class NewEntity(Base):
    __tablename__ = "new_entities"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

3. **Implement CRUD Operations**

```python
# backend/crud/new_entity.py
from sqlalchemy.orm import Session
from ..models.new_entity import NewEntity
from ..schemas.new_entity import NewEntityCreate

def create_new_entity(db: Session, entity_data: NewEntityCreate):
    db_entity = NewEntity(**entity_data.dict())
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return db_entity
```

4. **Create API Routes**

```python
# backend/routes/new_entity.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import new_entity as crud
from ..schemas.new_entity import NewEntityCreate, NewEntityResponse

router = APIRouter()

@router.post("/", response_model=NewEntityResponse)
def create_new_entity(
    entity_data: NewEntityCreate,
    db: Session = Depends(get_db)
):
    return crud.create_new_entity(db, entity_data)
```

### API Documentation

- **Interactive docs**: http://localhost:8000/docs
- **OpenAPI schema**: http://localhost:8000/openapi.json
- **Redoc**: http://localhost:8000/redoc

## Frontend Development

### Component Structure

```tsx
// components/NewComponent.tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function NewComponent({ title, variant = 'primary', className }: NewComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        'base-styles',
        variant === 'primary' && 'primary-styles',
        variant === 'secondary' && 'secondary-styles',
        className,
      )}
    >
      <h2>{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

### State Management

- **React Context** for global state
- **React Query** for server state
- **useState/useReducer** for local state

### Styling Guidelines

- **Tailwind CSS** utility classes
- **CSS variables** for themes
- **Responsive design** with mobile-first approach
- **Dark mode** support

## Debugging

### Frontend Debugging

```bash
# Chrome DevTools
# React DevTools extension
# Redux DevTools (if using Redux)

# Debug builds
npm run build
npm run start
```

### Backend Debugging

```python
# Add breakpoints
import pdb; pdb.set_trace()

# Debug mode
export DEBUG=true
python start.py

# Logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Performance Optimization

### Frontend

- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component
- **Bundle analysis** with webpack-bundle-analyzer
- **Lighthouse** performance audits

### Backend

- **Database indexing** for query optimization
- **Caching** with Redis
- **Connection pooling** for database
- **Background tasks** with Celery

## Security Checklist

### Frontend

- [ ] Input validation on all forms
- [ ] XSS protection
- [ ] CSRF token implementation
- [ ] Secure cookie settings
- [ ] Content Security Policy

### Backend

- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] Authentication on all protected routes
- [ ] Rate limiting implementation
- [ ] HTTPS enforcement

## Deployment

### Development Environment

- **Local development** with hot reload
- **Docker containers** for consistent environments
- **Environment variables** for configuration

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Troubleshooting

### Common Issues

#### Frontend

- **Node modules issues**: Delete `node_modules` and `package-lock.json`, run `npm install`
- **TypeScript errors**: Check `tsconfig.json` configuration
- **Build failures**: Check Next.js configuration and dependencies

#### Backend

- **Import errors**: Check Python path and virtual environment
- **Database connection**: Verify PostgreSQL is running and credentials are correct
- **Permission errors**: Check file permissions and user privileges

### Getting Help

- Check existing GitHub issues
- Review documentation
- Ask questions in team chat
- Create detailed bug reports with reproduction steps
