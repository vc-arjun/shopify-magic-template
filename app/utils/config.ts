import Config from "../config.json";

/**
 * Gets the OAuth authorization URL for Shopify app installation
 * @param config - Application configuration
 * @returns Complete OAuth authorization URL
 */
export function getOAuthUrl(): string {
  return `https://${Config.shop_id}.myshopify.com/admin/oauth/authorize?client_id=${Config.client_id}&redirect_uri=${Config.redirect_url}&state=${Config.merchant_id}&response_type=code`;
}
