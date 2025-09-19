#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let configFile = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--config=")) {
      configFile = arg.split("=")[1];
    } else if (arg === "--config" && i + 1 < args.length) {
      configFile = args[i + 1];
      i++; // Skip next argument as it's the value
    } else if (!arg.startsWith("--") && !configFile) {
      // Treat first non-option argument as config file path
      configFile = arg;
    }
  }

  return { configFile };
}

// Load and validate JSON config
function loadConfig(configPath) {
  try {
    const fullPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);

    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Error: Config file not found: ${fullPath}`);
      process.exit(1);
    }

    const configData = fs.readFileSync(fullPath, "utf8");
    const config = JSON.parse(configData);

    // Validate required fields
    const requiredFields = [
      "client_id",
      "merchant_id",
      "shop_id",
      "app_url",
      "scopes",
      "redirect_url",
    ];
    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
      console.error(
        `❌ Error: Missing required fields in config: ${missingFields.join(", ")}`,
      );
      console.log(
        "Required fields: client_id, merchant_id, shop_id, app_url, scopes, redirect_url",
      );
      process.exit(1);
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ Error: Invalid JSON in config file: ${error.message}`);
    } else {
      console.error(`❌ Error reading config file: ${error.message}`);
    }
    process.exit(1);
  }
}

// Set environment variables
function setEnvironmentVariables(config) {
  process.env.CLIENT_ID = config.client_id;
  process.env.MERCHANT_ID = config.merchant_id;
  process.env.SHOP_ID = config.shop_id;
  process.env.APP_URL = config.app_url;
  process.env.SCOPES = config.scopes;
  process.env.REDIRECT_URL = config.redirect_url;

  console.log("✅ Environment variables set:");
  console.log(`   CLIENT_ID=${config.client_id}`);
  console.log(`   MERCHANT_ID=${config.merchant_id}`);
  console.log(`   SHOP_ID=${config.shop_id}`);
  console.log(`   APP_URL=${config.app_url}`);
  console.log(`   SCOPES=${config.scopes}`);
  console.log(`   REDIRECT_URL=${config.redirect_url}`);
}

const args = parseArgs();

// Check if config file is provided
if (!args.configFile) {
  console.error("❌ Error: Config file is required");
  console.log("Usage:");
  console.log("  node setup-client.js <config-file>");
  console.log("  node setup-client.js --config=<config-file>");
  console.log("  npm run setup-client -- --config='config.json'");
  console.log("");
  console.log("Examples:");
  console.log("  node setup-client.js config.json");
  console.log("  node setup-client.js --config=config.json");
  console.log("  npm run setup-client -- --config='config.json'");
  console.log("");
  console.log("Config file should contain:");
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

const config = loadConfig(args.configFile);
setEnvironmentVariables(config);
const clientId = config.client_id;

// Path to the TOML file
const tomlPath = path.join(__dirname, "shopify.app.toml");

try {
  // Generate the complete TOML content
  const tomlContent = `# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

client_id = "${clientId}"
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
  console.log(`   client_id = "${clientId}"`);
  console.log(`   application_url = "${config.app_url}"`);
  console.log(`   scopes = "${config.scopes}"`);
  console.log(`   redirect_urls = [ "${config.redirect_url}" ]`);
} catch (error) {
  console.error("❌ Error generating TOML file:", error.message);
  process.exit(1);
}
