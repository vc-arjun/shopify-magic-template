import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { makeBEcall } from "../lib/backend-service";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_INSTALLED":
      console.log(`🎉 App installed on shop: ${shop}`);
      console.log('Session data:', session);
      
      // Send tokens to your backend immediately after installation
      if (session?.accessToken) {
        await makeBEcall({
          accessToken: session.accessToken,
          shop: shop,
          scope: session.scope || 'write_products',
          tokenType: 'bearer',
          expiresAt: session.expires ? new Date(session.expires) : undefined
        });
        
        console.log(`✅ Tokens sent to backend for shop: ${shop}`);
      } else {
        console.warn(`⚠️  No access token found for shop: ${shop}`);
      }
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return new Response("OK", { status: 200 });
};
