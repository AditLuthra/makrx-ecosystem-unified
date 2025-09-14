# Contributing to MakrCave

Thank you for your interest in contributing to MakrCave! This guide will help you get started with contributing to the project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites
Before you begin, ensure you have:
- Node.js 20+ and npm
- Python 3.11+
- PostgreSQL 14+
- Git knowledge
- Basic understanding of React, FastAPI, and PostgreSQL

### Development Setup
1. Fork the repository on GitHub
2. Clone your fork locally
3. Follow the setup instructions in [app/README.md](app/README.md)
4. Create a new branch for your feature or bugfix

## Types of Contributions

We welcome several types of contributions:

### 🐛 Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide system information
- Add screenshots if applicable

### ✨ Feature Requests
- Check existing issues first
- Describe the problem you're solving
- Propose a solution
- Consider backward compatibility

### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Documentation updates

### 📚 Documentation
- API documentation
- User guides
- Code comments
- README improvements

## Development Workflow

### 1. Branch Naming
Use descriptive branch names with prefixes:
```
feature/equipment-reservation-system
bugfix/inventory-count-error
docs/api-endpoint-documentation
hotfix/security-vulnerability
```

### 2. Commit Messages
Follow the Conventional Commits specification:
```
feat(equipment): add reservation conflict detection
fix(inventory): resolve stock count calculation bug
docs(api): update equipment endpoint documentation
test(auth): add unit tests for login flow
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 3. Pull Request Process

#### Before Submitting
- [ ] Run all tests and ensure they pass
- [ ] Run linting and fix any issues
- [ ] Update documentation if needed
- [ ] Add tests for new functionality
- [ ] Ensure code follows project conventions

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## Code Standards

### Frontend (TypeScript/React)
```typescript
// Use functional components with TypeScript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');
  
  return (
    <div className="component-wrapper">
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

**Standards:**
- Use TypeScript strict mode
- Implement proper error handling
- Follow React hooks best practices
- Use Tailwind CSS for styling
- Include proper prop types

### Backend (Python/FastAPI)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.example import ExampleCreate, ExampleResponse

router = APIRouter()

@router.post("/examples", response_model=ExampleResponse)
async def create_example(
    example_data: ExampleCreate,
    db: Session = Depends(get_db)
) -> ExampleResponse:
    """Create a new example with proper validation."""
    try:
        # Implementation
        pass
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**Standards:**
- Use type hints for all functions
- Implement proper error handling
- Follow FastAPI best practices
- Use Pydantic models for validation
- Include comprehensive docstrings

### Database
- Use descriptive table and column names
- Include proper indexes
- Implement foreign key constraints
- Add migration scripts for schema changes

## Testing Guidelines

### Frontend Testing
```typescript
// Unit test example
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  test('renders title correctly', () => {
    render(<MyComponent title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('calls onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

### Backend Testing
```python
import pytest
from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

def test_create_example():
    response = client.post(
        "/api/examples",
        json={"name": "Test Example", "description": "Test Description"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Example"

def test_create_example_validation_error():
    response = client.post("/api/examples", json={})
    assert response.status_code == 422
```

## Security Guidelines

### Authentication & Authorization
- Always validate user permissions
- Use secure session management
- Implement proper CORS policies
- Validate all input data

### Data Protection
- Encrypt sensitive data
- Use HTTPS in production
- Implement rate limiting
- Log security events

## Performance Guidelines

### Frontend Performance
- Use React.memo for expensive components
- Implement code splitting
- Optimize images and assets
- Monitor bundle size

### Backend Performance
- Use database indexes effectively
- Implement caching where appropriate
- Optimize database queries
- Use async/await properly

## Documentation Standards

### Code Documentation
```typescript
/**
 * Calculates the total cost of equipment usage
 * @param equipment - Equipment details
 * @param duration - Usage duration in hours
 * @param rate - Hourly rate
 * @returns Total cost including taxes
 */
function calculateUsageCost(
  equipment: Equipment,
  duration: number,
  rate: number
): number {
  // Implementation
}
```

### API Documentation
- Use OpenAPI/Swagger documentation
- Include request/response examples
- Document error responses
- Provide usage examples

## Review Process

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling implemented
- [ ] Edge cases considered

### Reviewer Guidelines
- Be constructive and respectful
- Focus on the code, not the person
- Provide specific suggestions
- Acknowledge good practices
- Ask questions for clarification

## Release Process

### Versioning
We use Semantic Versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Release notes prepared
- [ ] Security review completed
- [ ] Performance testing done

## Getting Help

### Resources
- [Project Documentation](README.md)
- [Development Guide](app/README.md)
- [API Documentation](backend/API_README.md)
- [Component Documentation](components/README.md)

### Support Channels
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Project Wiki for detailed guides
- Team communication channels

## Recognition

Contributors will be recognized in:
- README.md contributor section
- Release notes
- Project documentation
- Annual contributor highlights

Thank you for contributing to MakrCave! Your efforts help make makerspace management better for everyone.