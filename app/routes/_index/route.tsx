import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import styles from "./styles.module.css";
import { getOAuthUrl } from "app/utils/config";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
};

export default function App() {
  const url = getOAuthUrl();

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
