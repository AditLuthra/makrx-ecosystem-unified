#!/bin/bash

# Clean up test files
rm -f commit_test.py
rm -f quick_commit_test.py  
rm -f test_commit.sh
rm -f test_critical_errors.sh
rm -f remove_old_eslintrc.sh
rm -f run_test.sh

# Stage the actual fixes
git add .

# Attempt the commit
echo "🔄 Attempting git commit..."
git commit -m "Fix critical linting issues

- Fixed React hooks rules violations in multiple components
- Fixed ESLint configuration issues
- Added missing icon imports
- Fixed parsing errors in OG route
- Moved all hooks before conditional returns

Generated with [Memex](https://memex.tech)
Co-Authored-By: Memex <noreply@memex.tech>"