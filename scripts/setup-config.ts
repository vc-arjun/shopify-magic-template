#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to read shopify.app.toml, extract client_id, and create config.json
 * in the app folder using the schema from config.sample.json
 */

function parseTomlFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const config: Record<string, string> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine &&
        !trimmedLine.startsWith("#") &&
        trimmedLine.includes("=")
      ) {
        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("=").trim();

        // Remove quotes from the value
        const cleanValue = value.replace(/^["']|["']$/g, "");
        config[key.trim()] = cleanValue;
      }
    }

    return config;
  } catch (error: unknown) {
    console.error(`Error reading TOML file: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function writeJsonFile(filePath: string, data: Record<string, string>) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, "utf8");
    return true;
  } catch (error: unknown) {
    console.error(`Error writing JSON file: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

function main() {
  console.log("🔧 Setting up config.json from shopify.app.toml...\n");

  // Define file paths (go up one level from scripts/ to project root)
  const projectRoot = path.join(__dirname, "..");
  const tomlPath = path.join(projectRoot, "shopify.app.toml");
  const appConfigPath = path.join(projectRoot, "app", "config.json");

  // Check if required files exist
  if (!fs.existsSync(tomlPath)) {
    console.error("❌ shopify.app.toml file not found!");
    process.exit(1);
  }

  // Ensure app directory exists
  const appDir = path.join(projectRoot, "app");
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
    console.log("📁 Created app directory");
  }

  // Read and parse shopify.app.toml
  console.log("📖 Reading shopify.app.toml...");
  const tomlConfig = parseTomlFile(tomlPath);

  if (!tomlConfig) {
    console.error("❌ Failed to parse shopify.app.toml");
    process.exit(1);
  }

  // Extract client_id
  const clientId = tomlConfig.client_id;
  if (typeof clientId !== "string") {
    console.error("❌ client_id not found in shopify.app.toml");
    process.exit(1);
  }

  console.log(`✅ Found client_id: ${clientId}`);

  // Create new config with client_id
  const newConfig = {
    client_id: clientId,
    merchant_id: "merchant_id",
    shop_id: "magic-housekeeping",
    app_url: "https://localhost:3458",
    scopes: "read_products",
    redirect_url: "https://localhost:3458/auth/callback",
  };

  // Write config.json
  console.log("📝 Writing app/config.json...");
  const success = writeJsonFile(appConfigPath, newConfig);

  if (success) {
    console.log("✅ Successfully created app/config.json!");
    console.log("\n📄 Generated config:");
    console.log(JSON.stringify(newConfig, null, 2));
  } else {
    console.error("❌ Failed to write app/config.json");
    process.exit(1);
  }

  console.log("\n🎉 Setup complete!");
}

main();
