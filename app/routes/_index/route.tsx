import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const url = `https://${process.env.SHOP_ID}.myshopify.com/admin/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&state=${process.env.MERCHANT_ID}&response_type=code`;
  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Magic Checkout</h1>
        <p className={styles.text}>Elevate your checkout experience</p>
        <button
          onClick={() => {
            window.location.href = url;
          }}
          className={styles.button}
          type="submit"
        >
          Install Magic Checkout
        </button>
      </div>
    </div>
  );
}
