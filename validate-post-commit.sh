#!/bin/bash

echo "🎉 MakrX Ecosystem - Post-Commit Validation"
echo "==========================================="

# Check git status
echo "📋 Git Status:"
git log --oneline -1
echo ""

# Check project structure
echo "📁 Project Structure:"
echo "✅ Frontend Apps: $(ls apps/ | wc -l) applications"
echo "✅ Backend Services: $(ls backends/ | wc -l) services"
echo "✅ Shared Packages: $(ls packages/ | wc -l) packages"
echo ""

# Check key files
echo "📄 Documentation:"
[ -f README.md ] && echo "✅ README.md" || echo "❌ README.md missing"
[ -f INSTALLATION.md ] && echo "✅ INSTALLATION.md" || echo "❌ INSTALLATION.md missing"
[ -f CONTRIBUTING.md ] && echo "✅ CONTRIBUTING.md" || echo "❌ CONTRIBUTING.md missing"
echo ""

echo "🐳 Docker Configuration:"
[ -f docker-compose.yml ] && echo "✅ docker-compose.yml" || echo "❌ docker-compose.yml missing"
[ -f docker-compose.prod.yml ] && echo "✅ docker-compose.prod.yml" || echo "❌ docker-compose.prod.yml missing"
echo ""

echo "⚙️ CI/CD:"
[ -d .github/workflows ] && echo "✅ GitHub Actions workflows: $(ls .github/workflows/*.yml | wc -l) files" || echo "❌ GitHub Actions missing"
echo ""

echo "🔧 ESLint Configuration:"
[ -f .eslintrc.js ] && echo "✅ Root ESLint config" || echo "❌ Root ESLint config missing"
[ -f apps/gateway-frontend/.eslintrc.json ] && echo "✅ Gateway Frontend ESLint" || echo "❌ Gateway Frontend ESLint missing"
echo ""

echo "✨ Next Steps:"
echo "1. Run: npm ci --legacy-peer-deps"
echo "2. Run: ./scripts/unix/setup.sh (or scripts/windows/setup.bat on Windows)"
echo "3. Start development: npm run dev"
echo ""
echo "🚀 Your MakrX ecosystem is ready for development and contributors!"
