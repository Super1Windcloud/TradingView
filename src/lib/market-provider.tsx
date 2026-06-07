import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"

import type { MarketProvider } from "@/lib/market-data"

export type AggregateProvider = "auto" | MarketProvider

const aggregateProviderStorageKey = "astraquant-aggregate-provider"

interface MarketProviderContextValue {
  aggregateProvider: AggregateProvider
  setAggregateProvider: (provider: AggregateProvider) => void
}

const MarketProviderContext = createContext<MarketProviderContextValue | null>(null)

function readStoredAggregateProvider(): AggregateProvider {
  if (typeof window === "undefined") {
    return "auto"
  }

  const stored = window.localStorage.getItem(aggregateProviderStorageKey)

  if (
    stored === "auto" ||
    stored === "finnhub" ||
    stored === "alpha-vantage" ||
    stored === "tradingview"
  ) {
    return stored
  }

  return "auto"
}

export function MarketProviderStore({ children }: { children: ReactNode }) {
  const [aggregateProvider, setAggregateProvider] = useState<AggregateProvider>(
    readStoredAggregateProvider
  )

  useEffect(() => {
    window.localStorage.setItem(aggregateProviderStorageKey, aggregateProvider)
  }, [aggregateProvider])

  const value = useMemo<MarketProviderContextValue>(
    () => ({
      aggregateProvider,
      setAggregateProvider,
    }),
    [aggregateProvider]
  )

  return <MarketProviderContext.Provider value={value}>{children}</MarketProviderContext.Provider>
}

export function useMarketProviderStore() {
  const context = useContext(MarketProviderContext)

  if (!context) {
    throw new Error("useMarketProviderStore must be used within MarketProviderStore")
  }

  return context
}
