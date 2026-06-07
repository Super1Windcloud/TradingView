import { Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"
import { providerLabels } from "@/lib/market-data"
import { type AggregateProvider, useMarketProviderStore } from "@/lib/market-provider"

const aggregateProviderOptions: AggregateProvider[] = [
  "auto",
  "alpha-vantage",
  "finnhub",
  "tradingview",
]

export function MarketProviderSwitcher() {
  const { aggregateProvider, setAggregateProvider } = useMarketProviderStore()
  const { t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-2 px-2 text-xs"
          aria-label={t("aggregateProvider")}
        >
          <Database className="size-4" />
          <span className="hidden lg:inline">
            {getAggregateProviderLabel(aggregateProvider, t)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={aggregateProvider}>
          {aggregateProviderOptions.map((provider) => (
            <DropdownMenuRadioItem
              key={provider}
              value={provider}
              onClick={() => setAggregateProvider(provider)}
            >
              {getAggregateProviderLabel(provider, t)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getAggregateProviderLabel(
  provider: AggregateProvider,
  t: ReturnType<typeof useI18n>["t"]
) {
  if (provider === "auto") {
    return t("aggregateProviderAuto")
  }

  return providerLabels[provider]
}
