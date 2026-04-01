'use client'

import { Globe } from 'lucide-react'
import { useParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/navigation'
import {
  SUPPORTED_LOCALES,
  LOCALE_DISPLAY_NAMES,
  type SupportedLocale,
} from '@/lib/i18n/config'
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
} from '@/components/ui/menu'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 31536000 // 1 year

interface LanguageSwitcherProps {
  /** Additional CSS classes for the trigger button */
  className?: string
  /** Size variant */
  size?: 'sm' | 'default'
}

export const LanguageSwitcher = ({ className, size = 'default' }: LanguageSwitcherProps) => {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = (params?.locale as SupportedLocale) || 'en'
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  const switchLocale = (locale: SupportedLocale) => {
    if (locale === currentLocale) return
    document.cookie = `${LOCALE_COOKIE}=${locale}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
    router.push(pathname, { locale })
  }

  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type='button'
          className={`inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground ${className || ''}`}
          aria-label='Switch language'
        >
          <Globe className={iconSize} />
        </button>
      </MenuTrigger>
      <MenuPopup align='end' sideOffset={8}>
        {SUPPORTED_LOCALES.map((locale) => (
          <MenuItem
            key={locale}
            onSelect={() => switchLocale(locale)}
            className={locale === currentLocale ? 'font-semibold text-foreground' : ''}
          >
            {LOCALE_DISPLAY_NAMES[locale]}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  )
}
