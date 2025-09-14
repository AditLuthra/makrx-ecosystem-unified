#!/bin/bash

echo "🔄 Final commit attempt after fixing critical parsing errors..."

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Remove empty files that might cause issues
rm -f apps/gateway-frontend-hacker/.eslintrc.js

# Stage all fixes
git add .

# Attempt commit
git commit -m "Fix critical linting and parsing issues

- Fixed React hooks rules violations by moving hooks before conditional returns
- Fixed parsing errors in notifications-center and skill-management pages  
- Fixed ESLint configuration issues in gateway-frontend-hacker
- Converted JSX to React.createElement in OG route to resolve Edge runtime parsing
- Added missing icon imports
- Cleaned up broken mock data arrays

Generated with [Memex](https://memex.tech)
Co-Authored-By: Memex <noreply@memex.tech>"