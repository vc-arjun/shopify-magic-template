import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { makeBEcall } from "../lib/backend-service";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { payload, session, topic, shop } = await authenticate.webhook(request);
    console.log(`📝 Received ${topic} webhook for ${shop}`);

    const current = payload.current as string[];
    if (session) {
        await db.session.update({   
            where: {
                id: session.id
            },
            data: {
                scope: current.toString(),
            },
        });
        
        // Send updated tokens to backend
        console.log(`🔄 App scopes updated for shop: ${shop}`);
        await makeBEcall({
          accessToken: session.accessToken,
          shop: shop,
          scope: current.toString(),
          tokenType: 'bearer',
          expiresAt: session.expires ? new Date(session.expires) : undefined
        });
    }
    return new Response();
};
