import { createFileRoute } from "@tanstack/react-router"
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import {
  type AssetClass,
  getMarketSnapshot,
  type MarketProvider,
  type MarketSnapshot,
  type MarketSymbol,
  marketGroups,
  providerLabels,
} from "@/lib/market-data"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: MarketPage,
})

const providers: MarketProvider[] = ["finnhub", "massive", "twelvedata"]
const marketTabOrder: AssetClass[] = ["index", "stock", "crypto", "future", "forex", "etf"]
const orderedMarketGroups = marketTabOrder
  .map((assetClass) => marketGroups.find((group) => group.id === assetClass))
  .filter((group): group is (typeof marketGroups)[number] => Boolean(group))
const initialMarketGroup =
  orderedMarketGroups.find((group) => group.id === "index") ?? orderedMarketGroups[0]

type MarketGroup = (typeof marketGroups)[number]

interface MarketHomePage {
  url: string
  summary: string
  focus: string[]
  columns: string[]
}

const marketHomePages: Record<AssetClass, MarketHomePage> = {
  index: {
    url: "https://www.tradingview.com/markets/indices/",
    summary: "跟踪主要全球指数、指数期货和区域市场表现，适合作为大盘强弱的入口。",
    focus: ["Major indices", "World markets", "Index futures"],
    columns: ["Price", "Change %", "High", "Low", "Technical rating"],
  },
  stock: {
    url: "https://www.tradingview.com/markets/stocks-usa/",
    summary: "聚焦美国股票市场，按活跃度、涨跌幅、市值和行业维度筛选个股。",
    focus: ["US stocks", "Market movers", "Sectors"],
    columns: ["Price", "Change %", "Volume", "Market cap", "P/E"],
  },
  crypto: {
    url: "https://www.tradingview.com/markets/cryptocurrencies/",
    summary: "覆盖主流加密货币、交易对和市值排行，突出 24 小时波动和成交变化。",
    focus: ["Coins", "Market cap", "24h movers"],
    columns: ["Price", "Change %", "Volume 24h", "Market cap", "Rating"],
  },
  future: {
    url: "https://www.tradingview.com/markets/futures/",
    summary: "按能源、金属、农产品和指数期货组织合约，便于比较商品和风险资产走势。",
    focus: ["Energy", "Metals", "Agriculture", "Index contracts"],
    columns: ["Last", "Change %", "Open interest", "Contract", "Exchange"],
  },
  forex: {
    url: "https://www.tradingview.com/markets/currencies/",
    summary: "展示主要、次要和异国货币对，重点关注汇率变化和技术面概览。",
    focus: ["Major pairs", "Minor pairs", "Cross rates"],
    columns: ["Bid", "Ask", "Change %", "High", "Low"],
  },
  etf: {
    url: "https://www.tradingview.com/markets/etfs/",
    summary: "按资产类别、主题和地区整理 ETF，适合快速查看基金价格、规模和资金流向。",
    focus: ["Asset class", "Themes", "Regions"],
    columns: ["Price", "Change %", "AUM", "Volume", "Expense ratio"],
  },
}

function MarketPage() {
  const { t } = useI18n()
  const [provider, setProvider] = useState<MarketProvider>("finnhub")
  const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass>("index")
  const [selectedSymbol, setSelectedSymbol] = useState<MarketSymbol>(initialMarketGroup.symbols[0])
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const selectedMarketGroup =
    orderedMarketGroups.find((group) => group.id === selectedAssetClass) ?? initialMarketGroup

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return orderedMarketGroups
    }

    return orderedMarketGroups.filter((group) =>
      `${group.title} ${getAssetClassLabel(group.id, t)}`.toLowerCase().includes(normalizedQuery)
    )
  }, [query, t])

  function selectMarketGroup(assetClass: AssetClass) {
    const nextGroup =
      orderedMarketGroups.find((group) => group.id === assetClass) ?? initialMarketGroup

    setSelectedAssetClass(nextGroup.id)
    setSelectedSymbol(nextGroup.symbols[0])
  }

  useEffect(() => {
    let ignore = false

    async function loadSnapshot() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getMarketSnapshot(provider, selectedSymbol)

        if (!ignore) {
          setSnapshot(result)
        }
      } catch (requestError) {
        if (!ignore) {
          setSnapshot(null)
          setError(requestError instanceof Error ? requestError.message : String(requestError))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadSnapshot()

    return () => {
      ignore = true
    }
  }, [provider, selectedSymbol])

  return (
    <main className="flex min-h-full bg-background text-foreground">
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r bg-sidebar transition-[width]",
          isSidebarOpen ? "w-[260px]" : "w-[48px]"
        )}
      >
        <div className="flex h-12 items-center justify-between border-b px-3">
          {isSidebarOpen ? (
            <div className="flex min-w-0 items-center gap-2">
              <BarChart3 className="size-4 shrink-0" />
              <span className="truncate text-sm font-medium">AstraQuant</span>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={() => setIsSidebarOpen((value) => !value)}
            aria-label={isSidebarOpen ? t("sidebarToggleClose") : t("sidebarToggleOpen")}
          >
            {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
          </Button>
        </div>

        {isSidebarOpen ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b p-3">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-8"
                  placeholder={t("searchSymbol")}
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto py-2">
              {filteredGroups.map((group) => (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => selectMarketGroup(group.id)}
                  className={cn(
                    "flex h-9 w-full items-center justify-between px-3 text-left text-sm hover:bg-sidebar-accent",
                    selectedAssetClass === group.id && "bg-sidebar-accent font-medium"
                  )}
                >
                  <span>{getAssetClassLabel(group.id, t)}</span>
                  <span className="text-xs text-muted-foreground">{group.symbols.length}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b px-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">
              {getAssetClassLabel(selectedAssetClass, t)}
            </h1>
            <div className="truncate text-xs text-muted-foreground">
              {selectedSymbol.symbol} · {selectedSymbol.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as MarketProvider)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((item) => (
                  <SelectItem key={item} value={item}>
                    {providerLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={isLoading}
              onClick={() => setSelectedSymbol({ ...selectedSymbol })}
              aria-label={t("refreshQuotes")}
            >
              <RefreshCw className={cn(isLoading && "animate-spin")} />
            </Button>
          </div>
        </header>

        <Tabs
          value={selectedAssetClass}
          onValueChange={(value) => selectMarketGroup(value as AssetClass)}
          className="min-h-0 flex-1 gap-0"
        >
          <div className="border-b px-4 py-2">
            <TabsList variant="line" className="max-w-full overflow-x-auto">
              {orderedMarketGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id} className="px-3">
                  {getAssetClassLabel(group.id, t)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent
            value={selectedAssetClass}
            className="m-0 grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)]"
          >
            <MarketHomeSummary
              group={selectedMarketGroup}
              homepage={marketHomePages[selectedAssetClass]}
              label={getAssetClassLabel(selectedAssetClass, t)}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />

            <div className="border-b px-5 py-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-3xl font-semibold tracking-tight">
                    {formatPrice(snapshot?.price)}
                    {snapshot?.currency ? (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {snapshot.currency}
                      </span>
                    ) : null}
                  </div>
                  <div className={cn("mt-1 text-sm", getChangeClass(snapshot?.change))}>
                    {formatChange(snapshot?.change)} ({formatPercent(snapshot?.change_percent)})
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{providerLabels[provider]}</div>
                  <div>
                    {snapshot?.as_of ? `${t("asOf")} ${snapshot.as_of}` : t("waitingForData")}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-h-[360px] border-b p-5 lg:border-r lg:border-b-0">
                <div className="flex h-full min-h-[320px] items-center justify-center border bg-card">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <div className="text-sm font-medium">{t("chartArea")}</div>
                    <div className="mt-1 max-w-sm text-sm text-muted-foreground">
                      {t("chartPlaceholder")}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="min-h-0 overflow-auto p-5">
                <div className="space-y-5">
                  {error ? (
                    <div className="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <section>
                    <h2 className="text-sm font-medium">{t("overview")}</h2>
                    <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden border bg-border">
                      <QuoteStat label="Open" value={formatPrice(snapshot?.open)} />
                      <QuoteStat label="High" value={formatPrice(snapshot?.high)} />
                      <QuoteStat label="Low" value={formatPrice(snapshot?.low)} />
                      <QuoteStat label="Prev close" value={formatPrice(snapshot?.previous_close)} />
                      <QuoteStat label="Volume" value={formatCompact(snapshot?.volume)} />
                      <QuoteStat
                        label="Asset"
                        value={getAssetClassLabel(selectedSymbol.assetClass, t)}
                      />
                    </dl>
                  </section>

                  <section>
                    <h2 className="text-sm font-medium">{t("api")}</h2>
                    <div className="mt-3 space-y-2 text-sm">
                      <InfoRow label="Provider" value={providerLabels[provider]} />
                      <InfoRow label="Symbol" value={selectedSymbol.symbol} />
                      <InfoRow label="Source" value={snapshot?.source_note ?? t("notReturned")} />
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

function getAssetClassLabel(assetClass: AssetClass, t: ReturnType<typeof useI18n>["t"]) {
  const labels: Record<AssetClass, ReturnType<typeof t>> = {
    stock: t("assetStock"),
    index: t("assetIndex"),
    etf: t("assetEtf"),
    crypto: t("assetCrypto"),
    forex: t("assetForex"),
    future: t("assetFuture"),
  }

  return labels[assetClass]
}

function MarketHomeSummary({
  group,
  homepage,
  label,
  selectedSymbol,
  onSelectSymbol,
}: {
  group: MarketGroup
  homepage: MarketHomePage
  label: string
  selectedSymbol: MarketSymbol
  onSelectSymbol: (symbol: MarketSymbol) => void
}) {
  return (
    <section className="border-b px-5 py-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">{label}</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{homepage.summary}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={homepage.url} target="_blank" rel="noreferrer">
                <ExternalLink />
                TradingView
              </a>
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="border bg-card">
              <div className="border-b px-3 py-2 text-sm font-medium">Market sections</div>
              <div className="divide-y">
                {homepage.focus.map((item) => (
                  <div key={item} className="px-3 py-2 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="border bg-card">
              <div className="border-b px-3 py-2 text-sm font-medium">Table columns</div>
              <div className="divide-y">
                {homepage.columns.map((item) => (
                  <div key={item} className="px-3 py-2 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border bg-card">
          <div className="border-b px-3 py-2 text-sm font-medium">Representative symbols</div>
          <div className="divide-y">
            {group.symbols.map((item) => (
              <button
                type="button"
                key={item.symbol}
                onClick={() => onSelectSymbol(item)}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2 text-left text-sm hover:bg-accent",
                  selectedSymbol.symbol === item.symbol && "bg-accent"
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.symbol}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.name}</span>
                </span>
                <span className="self-center text-xs text-muted-foreground">{item.exchange}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function QuoteStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{value}</span>
    </div>
  )
}

function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--"
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 2 : 5,
  }).format(value)
}

function formatChange(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--"
  }

  return `${value > 0 ? "+" : ""}${formatPrice(value)}`
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--"
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
}

function formatCompact(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--"
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)
}

function getChangeClass(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "text-muted-foreground"
  }

  if (value > 0) {
    return "text-emerald-600 dark:text-emerald-400"
  }

  if (value < 0) {
    return "text-red-600 dark:text-red-400"
  }

  return "text-muted-foreground"
}
