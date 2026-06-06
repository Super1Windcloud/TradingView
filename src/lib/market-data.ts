import { invoke } from "@tauri-apps/api/core"

export type MarketProvider = "finnhub" | "massive" | "twelvedata"

export type AssetClass = "stock" | "index" | "etf" | "crypto" | "forex" | "future"

export interface MarketSymbol {
  symbol: string
  name: string
  assetClass: AssetClass
  exchange?: string
}

export interface MarketSnapshot {
  provider: MarketProvider
  symbol: string
  asset_class: AssetClass
  price: number | null
  change: number | null
  change_percent: number | null
  open: number | null
  high: number | null
  low: number | null
  previous_close: number | null
  volume: number | null
  currency: string | null
  as_of: string | null
  source_note: string
}

export async function getMarketSnapshot(provider: MarketProvider, marketSymbol: MarketSymbol) {
  return invoke<MarketSnapshot>("get_market_snapshot", {
    provider,
    symbol: marketSymbol.symbol,
    assetClass: marketSymbol.assetClass,
  })
}

export const providerLabels: Record<MarketProvider, string> = {
  finnhub: "Finnhub",
  massive: "Massive",
  twelvedata: "Twelve Data",
}

export const marketGroups: Array<{
  id: AssetClass
  title: string
  symbols: MarketSymbol[]
}> = [
  {
    id: "stock",
    title: "股票",
    symbols: [
      { symbol: "AAPL", name: "Apple", assetClass: "stock", exchange: "NASDAQ" },
      { symbol: "MSFT", name: "Microsoft", assetClass: "stock", exchange: "NASDAQ" },
      { symbol: "TSLA", name: "Tesla", assetClass: "stock", exchange: "NASDAQ" },
      { symbol: "NVDA", name: "NVIDIA", assetClass: "stock", exchange: "NASDAQ" },
    ],
  },
  {
    id: "index",
    title: "指数",
    symbols: [
      { symbol: "SPY", name: "S&P 500 proxy", assetClass: "index", exchange: "NYSE Arca" },
      { symbol: "QQQ", name: "Nasdaq 100 proxy", assetClass: "index", exchange: "NASDAQ" },
      { symbol: "DIA", name: "Dow proxy", assetClass: "index", exchange: "NYSE Arca" },
    ],
  },
  {
    id: "etf",
    title: "ETF",
    symbols: [
      { symbol: "VOO", name: "Vanguard S&P 500 ETF", assetClass: "etf", exchange: "NYSE Arca" },
      { symbol: "IWM", name: "iShares Russell 2000 ETF", assetClass: "etf", exchange: "NYSE Arca" },
      { symbol: "GLD", name: "SPDR Gold Shares", assetClass: "etf", exchange: "NYSE Arca" },
    ],
  },
  {
    id: "crypto",
    title: "加密货币",
    symbols: [
      {
        symbol: "BINANCE:BTCUSDT",
        name: "Bitcoin / USDT",
        assetClass: "crypto",
        exchange: "Binance",
      },
      {
        symbol: "BINANCE:ETHUSDT",
        name: "Ethereum / USDT",
        assetClass: "crypto",
        exchange: "Binance",
      },
      { symbol: "X:BTCUSD", name: "Bitcoin / USD", assetClass: "crypto", exchange: "Massive" },
    ],
  },
  {
    id: "forex",
    title: "外汇",
    symbols: [
      { symbol: "OANDA:EUR_USD", name: "EUR / USD", assetClass: "forex", exchange: "OANDA" },
      { symbol: "OANDA:USD_JPY", name: "USD / JPY", assetClass: "forex", exchange: "OANDA" },
      { symbol: "C:EURUSD", name: "EUR / USD", assetClass: "forex", exchange: "Massive" },
    ],
  },
  {
    id: "future",
    title: "期货",
    symbols: [
      { symbol: "ES=F", name: "E-mini S&P 500", assetClass: "future", exchange: "CME" },
      { symbol: "NQ=F", name: "E-mini Nasdaq 100", assetClass: "future", exchange: "CME" },
      { symbol: "CL=F", name: "Crude Oil", assetClass: "future", exchange: "NYMEX" },
    ],
  },
]
