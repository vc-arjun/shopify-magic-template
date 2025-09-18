import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`🗑️  Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
    
    // TODO: Notify your backend that the app was uninstalled
    // This way you can clean up tokens and stop processing orders for this shop
    console.log(`🔔 Should notify backend about app uninstall for: ${shop}`);
  }

  return new Response();
};
