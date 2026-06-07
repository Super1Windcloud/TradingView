import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef } from "react"

import type { Locale } from "@/lib/i18n"

interface TradingViewSymbolOverviewProps {
  locale: Locale
  symbol: string
  title: string
}

export function TradingViewSymbolOverview({
  locale,
  symbol,
  title,
}: TradingViewSymbolOverviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme, theme } = useTheme()

  const colorTheme = useMemo(() => {
    const activeTheme = resolvedTheme ?? theme ?? "system"
    return activeTheme === "light" ? "light" : "dark"
  }, [resolvedTheme, theme])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    container.innerHTML = ""

    const widgetHost = document.createElement("div")
    widgetHost.className = "tradingview-widget-container__widget h-full w-full"

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [[title, `${symbol}|1D`]],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: locale === "zh-CN" ? "zh_CN" : "en",
      colorTheme,
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
    })

    widgetHost.appendChild(script)
    container.appendChild(widgetHost)

    return () => {
      container.innerHTML = ""
    }
  }, [colorTheme, locale, symbol, title])

  return (
    <div ref={containerRef} className="tradingview-widget-container h-[520px] w-full">
      <div className="h-full w-full" />
    </div>
  )
}
