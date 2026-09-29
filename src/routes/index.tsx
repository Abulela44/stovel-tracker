import { createFileRoute } from "@tanstack/react-router";
import { StokvelApp } from "@/components/StokvelApp";

const title = "FBI Wealth Accumators Stokvel";
const description =
  "Manage your stokvel: track member contributions, rotation payouts, group loans, voting motions and a transparent audit ledger.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: StokvelApp,
});
