#!/bin/bash

echo "🔍 Verifying MakrX Setup"
echo "========================"

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

echo "Current directory: $(pwd)"
echo ""

echo "Checking each app's dependencies:"
for app in gateway-frontend gateway-frontend-hacker makrcave makrx-events makrx-store; do
	echo -n "  $app: "
	if [ -d "apps/$app/node_modules" ]; then
		count=$(find "apps/$app/node_modules" -maxdepth 1 -type d | wc -l)
		echo "✅ ($count packages)"
	else
		echo "❌ No node_modules"
		echo "    Trying to install..."
		cd "apps/$app"
		npm install --legacy-peer-deps >/dev/null 2>&1 &
		install_pid=$!
		cd ../..
		echo "    Installation started (PID: $install_pid)"
	fi
done

echo ""
echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "Docker not accessible"

echo ""
echo "Next steps:"
echo "  1. Wait for any ongoing installations to complete"
echo "  2. Run: npm run diagnose"
echo "  3. Try: npm run test-single"
