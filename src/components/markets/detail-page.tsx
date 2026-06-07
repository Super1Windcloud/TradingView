import { Link } from "@tanstack/react-router"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { MarketSidebar } from "@/components/markets/sidebar"
import { TradingViewSymbolOverview } from "@/components/markets/tradingview-symbol-overview"
import { Button } from "@/components/ui/button"
import { type Locale, useI18n } from "@/lib/i18n"
import {
  getMarketItemDetail,
  type MarketItemDetailResponse,
  type MarketKind,
  type MarketProvider,
  providerLabels,
} from "@/lib/market-data"
import { useMarketProviderStore } from "@/lib/market-provider"
import { cn } from "@/lib/utils"

interface MarketDetailPageProps {
  itemId: string
  kind: MarketKind
}

export function MarketDetailPage({ itemId, kind }: MarketDetailPageProps) {
  const { t, locale } = useI18n()
  const { aggregateProvider } = useMarketProviderStore()
  const [reloadToken, setReloadToken] = useState(0)
  const [detail, setDetail] = useState<MarketItemDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    void reloadToken

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getMarketItemDetail(
          kind,
          itemId,
          aggregateProvider === "auto" ? undefined : aggregateProvider
        )

        if (!ignore) {
          setDetail(response)
        }
      } catch (requestError) {
        if (!ignore) {
          setDetail(null)
          setError(requestError instanceof Error ? requestError.message : String(requestError))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [aggregateProvider, itemId, kind, reloadToken])

  const listPath = kind === "indices" ? "/" : `/${kind}`
  const sidebarFooter = formatAggregateProvider(aggregateProvider, detail?.provider ?? null, t)
  const tradingViewLink = detail?.tradingview_symbol
    ? `https://www.tradingview.com/symbols/${detail.tradingview_symbol.replace(":", "-").replace("!", "")}/`
    : null

  return (
    <main className="flex min-h-full bg-background text-foreground">
      <MarketSidebar footer={sidebarFooter} />

      <section className="min-w-0 flex-1 bg-background">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col px-5 pt-6 pb-8 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              to={listPath as never}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {t("detailBackToList")}
            </Link>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-border/60 bg-background/68 text-foreground backdrop-blur-md hover:bg-accent/50 hover:text-foreground"
              onClick={() => setReloadToken((value) => value + 1)}
              disabled={isLoading}
              aria-label={t("marketsRefresh")}
            >
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            </Button>
          </div>

          {error ? (
            <div className="mt-4 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {t("detailLoadFailed")}: {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0">
              <div className="rounded-xl border border-border/60 bg-background/72 px-6 py-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/58">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-accent/45 px-2 py-1 text-[12px] font-medium text-foreground">
                    {detail?.symbol ?? itemId.toUpperCase()}
                  </span>
                  {detail?.technical_rating ? (
                    <span
                      className={cn("text-sm font-medium", getRatingClass(detail.technical_rating))}
                    >
                      {detail.technical_rating}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-[26px] font-semibold text-foreground">
                  {detail?.name ?? itemId}
                </h1>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span>
                    {t("detailRegion")}: {detail?.region ?? "--"}
                  </span>
                  <span>
                    {t("detailProvider")}:{" "}
                    {detail?.provider ? providerLabels[detail.provider] : "--"}
                  </span>
                  <span>
                    {t("detailUpdatedAt")}: {detail?.as_of ?? "--"}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricCard
                    label={t("indicesTablePrice")}
                    value={formatMarketValue(detail?.price, locale, 2)}
                    accent={getSignedColorClass(detail?.change)}
                  />
                  <MetricCard
                    label={t("indicesTableChangePct")}
                    value={formatPercent(detail?.change_percent, locale)}
                    accent={getSignedColorClass(detail?.change_percent)}
                  />
                  <MetricCard
                    label={t("indicesTableChange")}
                    value={formatSignedValue(detail?.change, locale, 2)}
                    accent={getSignedColorClass(detail?.change)}
                  />
                  <MetricCard
                    label={t("indicesTableHigh")}
                    value={formatMarketValue(detail?.high, locale, 2)}
                  />
                  <MetricCard
                    label={t("indicesTableLow")}
                    value={formatMarketValue(detail?.low, locale, 2)}
                  />
                  <MetricCard
                    label={t("detailPreviousClose")}
                    value={formatMarketValue(detail?.previous_close, locale, 2)}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border/60 bg-background/72 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/58">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-foreground">{t("detailChartTitle")}</div>
                  {tradingViewLink ? (
                    <a
                      href={tradingViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      TradingView
                    </a>
                  ) : null}
                </div>

                {detail?.tradingview_symbol ? (
                  <TradingViewSymbolOverview
                    locale={locale}
                    symbol={detail.tradingview_symbol}
                    title={detail.symbol}
                  />
                ) : (
                  <div className="flex h-[520px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
                    {t("detailChartUnavailable")}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/72 px-5 py-5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/58">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("detailSource")}
                </div>
                <div className="mt-3 text-sm leading-7 text-foreground/85">
                  {detail?.source_note ?? "--"}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/72 px-5 py-5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/58">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("aggregateProvider")}
                </div>
                <div className="mt-3 text-sm text-foreground/85">{sidebarFooter}</div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ accent, label, value }: { accent?: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/55 px-4 py-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-lg font-semibold text-foreground", accent)}>{value}</div>
    </div>
  )
}

function formatMarketValue(
  value: number | null | undefined,
  locale: Locale,
  maximumFractionDigits = 2
) {
  if (typeof value !== "number") {
    return "--"
  }

  const abs = Math.abs(value)
  const digits = abs >= 1000 ? 2 : abs >= 100 ? 2 : abs >= 1 ? 2 : 4

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.max(maximumFractionDigits, digits),
  }).format(value)
}

function formatSignedValue(
  value: number | null | undefined,
  locale: Locale,
  maximumFractionDigits = 2
) {
  if (typeof value !== "number") {
    return "--"
  }

  const formatted = formatMarketValue(Math.abs(value), locale, maximumFractionDigits)
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatted}`
}

function formatPercent(value: number | null | undefined, locale: Locale) {
  if (typeof value !== "number") {
    return "--"
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))

  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatted}%`
}

function getSignedColorClass(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "text-foreground"
  }

  if (value > 0) {
    return "text-emerald-400"
  }

  if (value < 0) {
    return "text-rose-400"
  }

  return "text-foreground"
}

function getRatingClass(value: string) {
  if (value === "Strong buy" || value === "Buy") {
    return "text-emerald-400"
  }

  if (value === "Strong sell" || value === "Sell") {
    return "text-rose-400"
  }

  return "text-amber-300"
}

function formatAggregateProvider(
  aggregateProvider: "auto" | MarketProvider,
  resolvedProvider: MarketProvider | null,
  t: (key: never) => string
) {
  if (aggregateProvider === "auto") {
    return resolvedProvider
      ? `${t("aggregateProviderAuto" as never)} · ${providerLabels[resolvedProvider]}`
      : t("aggregateProviderAuto" as never)
  }

  return providerLabels[aggregateProvider]
}
