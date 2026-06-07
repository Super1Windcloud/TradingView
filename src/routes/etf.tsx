import { createFileRoute } from "@tanstack/react-router"

import { EtfOverviewPage } from "@/components/markets/etf-overview-page"

export const Route = createFileRoute("/etf")({
  component: EtfPage,
})

function EtfPage() {
  return <EtfOverviewPage />
}
