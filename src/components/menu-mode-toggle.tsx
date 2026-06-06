import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { Palette, Sprout, SunMoon, Waves } from "lucide-react"
import { useTheme } from "next-themes"

import {
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useI18n } from "@/lib/i18n"

const themeOptions = [
  { value: "light", labelKey: "themeLight", icon: SunIcon },
  { value: "dark", labelKey: "themeDark", icon: MoonIcon },
  { value: "dim", labelKey: "themeDim", icon: SunMoon },
  { value: "ocean", labelKey: "themeOcean", icon: Waves },
  { value: "avocado", labelKey: "themeAvocado", icon: Sprout },
] as const

export function MenuModeToggle() {
  const { setTheme, theme: activeTheme } = useTheme()
  const { t } = useI18n()

  return (
    <MenubarMenu>
      <MenubarTrigger className="gap-2">
        <Palette className="h-4 w-4" />
        {t("theme")}
      </MenubarTrigger>
      <MenubarContent forceMount>
        <MenubarRadioGroup value={activeTheme ?? "system"}>
          {themeOptions.map(({ value, labelKey, icon: Icon }) => (
            <MenubarRadioItem key={value} value={value} onClick={() => setTheme(value)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{t(labelKey)}</span>
            </MenubarRadioItem>
          ))}
          <MenubarRadioItem value="system" onClick={() => setTheme("system")}>
            <LaptopIcon className="mr-2 h-4 w-4" />
            <span>{t("themeSystem")}</span>
          </MenubarRadioItem>
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}
