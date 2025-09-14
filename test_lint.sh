#!/bin/bash

echo "Testing linting across all workspaces..."

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Test each workspace individually
echo "1. Testing gateway-frontend..."
npm run lint --workspace=@makrx/gateway-frontend > /tmp/lint_frontend.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ gateway-frontend: PASSED"
else
    echo "❌ gateway-frontend: FAILED"
    tail -5 /tmp/lint_frontend.log
fi

echo "2. Testing gateway-frontend-hacker..."
npm run lint --workspace=@makrx/gateway-frontend-hacker > /tmp/lint_hacker.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ gateway-frontend-hacker: PASSED"
else
    echo "❌ gateway-frontend-hacker: FAILED"
    tail -5 /tmp/lint_hacker.log
fi

echo "3. Testing makrcave..."
npm run lint --workspace=@makrx/makrcave > /tmp/lint_makrcave.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ makrcave: PASSED"
else
    echo "❌ makrcave: FAILED"
    tail -5 /tmp/lint_makrcave.log
fi

echo "4. Testing makrx-events..."
npm run lint --workspace=@makrx/makrx-events > /tmp/lint_events.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ makrx-events: PASSED"
else
    echo "❌ makrx-events: FAILED"
    tail -5 /tmp/lint_events.log
fi

echo "5. Testing makrx-store..."
npm run lint --workspace=@makrx/makrx-store > /tmp/lint_store.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ makrx-store: PASSED"
else
    echo "❌ makrx-store: FAILED"
    tail -5 /tmp/lint_store.log
fi

echo "Done!"