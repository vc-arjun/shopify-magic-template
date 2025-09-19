#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppConfig {
  client_id: string;
  merchant_id: string;
  shop_id: string;
  app_url: string;
  scopes: string;
  redirect_url: string;
}

// Import the config utility

console.log("🚀 Setting up Shopify app configuration...");

function loadConfig(): AppConfig {
  const configPath = path.join(process.cwd(), "app", "config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);

    // Validate required fields
    const requiredFields: (keyof AppConfig)[] = [
      "client_id",
      "merchant_id",
      "shop_id",
      "app_url",
      "scopes",
      "redirect_url",
    ];

    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields in config: ${missingFields.join(", ")}. ` +
          `Required fields: ${requiredFields.join(", ")}`,
      );
    }

    // Return typed config object
    return {
      client_id: config.client_id,
      merchant_id: config.merchant_id,
      shop_id: config.shop_id,
      app_url: config.app_url,
      scopes: config.scopes,
      redirect_url: config.redirect_url,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${error.message}`);
    }
    throw error;
  }
}

let config: AppConfig;
try {
  config = loadConfig();
  console.log("✅ Configuration loaded and validated successfully");
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`❌ Error: ${errorMessage}`);
  console.log("");
  console.log(
    "Make sure you have a config.json file in the project root with:",
  );
  console.log("  {");
  console.log('    "client_id": "your-client-id",');
  console.log('    "merchant_id": "your-merchant-id",');
  console.log('    "shop_id": "your-shop-id",');
  console.log('    "app_url": "your-app-url",');
  console.log('    "scopes": "scope_1,scope_2",');
  console.log('    "redirect_url": "https://your-app.com/auth/callback"');
  console.log("  }");
  process.exit(1);
}

// Path to the TOML file
const tomlPath = path.join(__dirname, "shopify.app.toml");

try {
  // Generate the complete TOML content
  const tomlContent = `# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

client_id = "${config.client_id}"
name = "Magic Checkout"
application_url = "${config.app_url}"
embedded = true

[build]
automatically_update_urls_on_dev = true

[webhooks]
api_version = "2025-10"

[access_scopes]
scopes = "${config.scopes}"

[auth]
redirect_urls = [ "${config.redirect_url}" ]
`;

  // Write the generated content to the file
  fs.writeFileSync(tomlPath, tomlContent, "utf8");
  console.log("✅ Successfully generated shopify.app.toml file:");
  console.log(`   client_id = "${config.client_id}"`);
  console.log(`   application_url = "${config.app_url}"`);
  console.log(`   scopes = "${config.scopes}"`);
  console.log(`   redirect_urls = [ "${config.redirect_url}" ]`);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("❌ Error generating TOML file:", errorMessage);
  process.exit(1);
}
