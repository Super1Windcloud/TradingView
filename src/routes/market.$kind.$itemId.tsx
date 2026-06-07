import { createFileRoute } from "@tanstack/react-router"

import { MarketDetailPage } from "@/components/markets/detail-page"
import type { MarketKind } from "@/lib/market-data"

export const Route = createFileRoute("/market/$kind/$itemId")({
  component: MarketDetailRoute,
})

function MarketDetailRoute() {
  const { itemId, kind } = Route.useParams()

  return <MarketDetailPage itemId={itemId} kind={kind as MarketKind} />
}
