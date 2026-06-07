import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { useI18n } from "@/lib/i18n"
import { marketNavigationItems } from "@/lib/market-data"
import { cn } from "@/lib/utils"

interface MarketSidebarProps {
  currentView: string
  footer?: ReactNode
}

const baseItemClass =
  "flex h-9 w-full items-center rounded-md px-3 text-left text-sm transition-colors"

export function MarketSidebar({ currentView, footer }: MarketSidebarProps) {
  const { t } = useI18n()

  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-[#2b2e33] bg-[#17191b] lg:flex lg:flex-col">
      <div className="flex h-12 items-center border-b border-[#2b2e33] px-4">
        <span className="text-sm font-semibold text-[#f3f4f6]">AstraQuant</span>
      </div>

      <div className="flex-1 px-3 py-4">
        <div className="px-2 text-[11px] tracking-wide text-[#7f878f] uppercase">Markets</div>
        <div className="mt-2 space-y-1">
          {marketNavigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className={baseItemClass}
              activeProps={{
                className: cn(baseItemClass, "bg-[#25292d] text-[#f3f4f6]"),
              }}
              inactiveProps={{
                className: cn(
                  baseItemClass,
                  "text-[#a7afb7] hover:bg-[#212428] hover:text-[#eceff2]"
                ),
              }}
            >
              {t(item.i18nKey as never)}
            </Link>
          ))}
        </div>

        <div className="mt-6 px-2 text-[11px] tracking-wide text-[#7f878f] uppercase">
          Current view
        </div>
        <div className="mt-2 rounded-md border border-[#2b2f34] bg-[#1d2023] px-3 py-3 text-sm text-[#c7cdd4]">
          {currentView}
        </div>
      </div>

      <div className="border-t border-[#2b2e33] px-4 py-3 text-xs text-[#7f878f]">{footer}</div>
    </aside>
  )
}
