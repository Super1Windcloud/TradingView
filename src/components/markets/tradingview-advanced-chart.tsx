import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface TradingViewAdvancedChartProps {
  className?: string
  height?: number
  symbol: string
}

export function TradingViewAdvancedChart({
  className,
  height = 520,
  symbol,
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme, theme } = useTheme()
  const widgetTheme = resolvedTheme === "light" ? "light" : theme === "light" ? "light" : "dark"

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    container.innerHTML = ""

    const widgetHost = document.createElement("div")
    widgetHost.className = "tradingview-widget-container__widget h-full w-full"
    container.appendChild(widgetHost)

    const copyright = document.createElement("div")
    copyright.className = "tradingview-widget-copyright hidden"
    container.appendChild(copyright)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: widgetTheme,
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    })

    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [symbol, widgetTheme])

  return (
    <div
      className={cn("overflow-hidden rounded-lg border border-border/60 bg-background", className)}
      style={{ height }}
    >
      <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
    </div>
  )
}
