#!/bin/bash
echo "🧪 Testing MakrX Ecosystem Setup..."

# Test if all required files exist
files_to_check=(
	"README.md"
	"INSTALLATION.md"
	"CONTRIBUTING.md"
	"package.json"
	".env.example"
	"docker-compose.yml"
	".github/workflows/ci.yml"
	".github/workflows/security.yml"
	"scripts/unix/setup.sh"
	"scripts/windows/setup.bat"
)

all_good=true
for file in "${files_to_check[@]}"; do
	if [ -f "$file" ]; then
		echo "✅ $file exists"
	else
		echo "❌ $file missing"
		all_good=false
	fi
done

if $all_good; then
	echo "🎉 All essential files are present!"
	echo "✨ MakrX Ecosystem is ready for GitHub!"
else
	echo "⚠️ Some files are missing. Please run the setup scripts."
fi
