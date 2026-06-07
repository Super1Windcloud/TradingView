import { createFileRoute } from "@tanstack/react-router"

import { MarketOverviewPage } from "@/components/markets/overview-page"

export const Route = createFileRoute("/forex")({
  component: ForexPage,
})

function ForexPage() {
  return <MarketOverviewPage asset="forex" />
}
