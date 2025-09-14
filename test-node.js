#!/usr/bin/env node

console.log("🧪 Testing MakrX Ecosystem Setup");
console.log("================================");

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
console.log(`Project root: ${projectRoot}`);

// Check apps structure
const appsDir = path.join(projectRoot, "apps");
if (fs.existsSync(appsDir)) {
  const apps = fs
    .readdirSync(appsDir)
    .filter((name) => fs.statSync(path.join(appsDir, name)).isDirectory());
  console.log(`\nFrontend apps found: ${apps.length}`);

  apps.forEach((app) => {
    const nodeModulesPath = path.join(appsDir, app, "node_modules");
    const packageJsonPath = path.join(appsDir, app, "package.json");

    const hasNodeModules = fs.existsSync(nodeModulesPath);
    const hasPackageJson = fs.existsSync(packageJsonPath);

    console.log(
      `  ${hasNodeModules ? "✅" : "❌"} ${app}: ${hasNodeModules ? "Ready" : "Missing dependencies"}`,
    );

    if (hasPackageJson && !hasNodeModules) {
      console.log(`    📦 Need to run: cd apps/${app} && npm install`);
    }
  });
}

// Check backends
const backendsDir = path.join(projectRoot, "backends");
if (fs.existsSync(backendsDir)) {
  const backends = fs
    .readdirSync(backendsDir)
    .filter((name) => fs.statSync(path.join(backendsDir, name)).isDirectory());
  console.log(`\nBackend services found: ${backends.length}`);
  backends.forEach((backend) => {
    console.log(`  📡 ${backend}`);
  });
}

console.log("\n🚀 Quick start commands:");
console.log("  npm install --workspace=apps/gateway-frontend");
console.log("  npm install --workspace=apps/makrcave");
console.log("  npm install --workspace=apps/makrx-events");
console.log("  npm install --workspace=apps/makrx-store");
console.log("  docker-compose up -d");
