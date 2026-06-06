import { getCurrentWindow } from "@tauri-apps/api/window"
import { ImageIcon } from "lucide-react"
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"

import logo1 from "@/assets/logo1.png"
import logo2 from "@/assets/logo2.png"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"

const appIconStorageKey = "astraquant-app-icon"

const appIcons = {
  logo1: { labelKey: "appIconLogo1", src: logo1 },
  logo2: { labelKey: "appIconLogo2", src: logo2 },
} as const

export type AppIconId = keyof typeof appIcons

interface AppIconContextValue {
  activeIcon: AppIconId
  activeIconSrc: string
  setActiveIcon: (icon: AppIconId) => void
}

const AppIconContext = createContext<AppIconContextValue | null>(null)

function readStoredAppIcon(): AppIconId {
  if (typeof window === "undefined") {
    return "logo1"
  }

  const stored = window.localStorage.getItem(appIconStorageKey)
  return stored === "logo2" ? "logo2" : "logo1"
}

function setFavicon(src: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")

  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    link.type = "image/png"
    document.head.appendChild(link)
  }

  link.href = src
}

async function setTauriWindowIcon(src: string) {
  const response = await fetch(src)
  const bytes = new Uint8Array(await response.arrayBuffer())
  await getCurrentWindow().setIcon(bytes)
}

export function AppIconProvider({ children }: { children: ReactNode }) {
  const [activeIcon, setActiveIcon] = useState<AppIconId>(readStoredAppIcon)
  const activeIconSrc = appIcons[activeIcon].src

  useEffect(() => {
    window.localStorage.setItem(appIconStorageKey, activeIcon)
    setFavicon(activeIconSrc)

    setTauriWindowIcon(activeIconSrc).catch((error) => {
      console.error("[AppIconProvider] Failed to set window icon", error)
    })
  }, [activeIcon, activeIconSrc])

  const value = useMemo<AppIconContextValue>(
    () => ({
      activeIcon,
      activeIconSrc,
      setActiveIcon,
    }),
    [activeIcon, activeIconSrc]
  )

  return <AppIconContext.Provider value={value}>{children}</AppIconContext.Provider>
}

export function useAppIcon() {
  const context = useContext(AppIconContext)

  if (!context) {
    throw new Error("useAppIcon must be used within AppIconProvider")
  }

  return context
}

export function AppIconMark() {
  const { activeIconSrc } = useAppIcon()

  return <img src={activeIconSrc} alt="" className="size-5 shrink-0 rounded-sm object-cover" />
}

export function AppIconSwitcher() {
  const { activeIcon, setActiveIcon } = useAppIcon()
  const { t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("appIcon")}>
          <ImageIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={activeIcon}>
          {Object.entries(appIcons).map(([value, icon]) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              onClick={() => setActiveIcon(value as AppIconId)}
            >
              <img src={icon.src} alt="" className="mr-2 size-4 rounded-sm object-cover" />
              {t(icon.labelKey)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
