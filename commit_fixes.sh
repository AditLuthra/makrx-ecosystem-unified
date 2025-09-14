#!/bin/bash

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

echo "🔄 Staging all changes..."
git add .

echo "📝 Committing fixes..."
git commit -m "Fix critical linting and parsing issues

- Fixed React hooks rules violations by moving hooks before conditional returns
- Fixed parsing errors in notifications-center and skill-management pages  
- Fixed ESLint configuration issues in gateway-frontend-hacker
- Converted JSX to React.createElement in OG route to resolve Edge runtime parsing
- Added missing icon imports
- Cleaned up broken mock data arrays

Generated with [Memex](https://memex.tech)
Co-Authored-By: Memex <noreply@memex.tech>"

echo "✅ Commit completed!"