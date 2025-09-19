import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log(request.url);
  const { session } = await authenticate.admin(request);

  console.log("✅ OAuth exchange completed successfully!");
  console.log("🔑 Access Token:", session?.accessToken);
  console.log("🏪 Shop:", session?.shop);
  console.log("📋 Scopes:", session?.scope);
  console.log("⏰ Expires:", session?.expires);
  console.log("🆔 Session ID:", session?.id);

  return null;
};
