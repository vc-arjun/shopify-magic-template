#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Magic Checkout button block file (go up one level from scripts/ to project root)
const projectRoot = path.join(__dirname, "..");
const magicCheckoutBlockPath = path.join(projectRoot, "extensions", "magic-checkout", "blocks", "magic_checkout_button.liquid");

try {
  // Generate the Magic Checkout block content
  const magicCheckoutBlockContent = `<!-- Magic Checkout Site-wide Block -->
{% render 'magic_checkout_embed' %}

{% schema %}
{
  "name": "Magic Checkout",
  "target": "body"
}
{% endschema %}
`;

  // Write the Magic Checkout block content to the file
  fs.writeFileSync(magicCheckoutBlockPath, magicCheckoutBlockContent, "utf8");
  console.log("✅ Successfully generated magic_checkout_button.liquid block file");
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("❌ Error generating Magic Checkout block file:", errorMessage);
  process.exit(1);
}