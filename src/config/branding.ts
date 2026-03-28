export interface ThemeColors {
  primaryColor?: string
  primaryHoverColor?: string
  accentColor?: string
  accentHoverColor?: string
  backgroundColor?: string
}

export interface GeoConfig {
  aiDescription: string
  primaryKeywords: string[]
  socialLinks?: {
    github?: string
    twitter?: string
    discord?: string
    website?: string
  }
  softwareCategory?: string
  pricingType?: string
  operatingSystem?: string
}

export interface BrandConfig {
  name: string
  logoUrl?: string
  faviconUrl?: string
  customCssUrl?: string
  supportEmail?: string
  documentationUrl?: string
  termsUrl?: string
  privacyUrl?: string
  theme?: ThemeColors
  geo?: GeoConfig
}

/**
 * Default brand configuration values
 */
const defaultConfig: BrandConfig = {
  // TODO: Replace 'My SaaS App' with your product name
  name: 'My SaaS App',
  logoUrl: undefined,
  faviconUrl: '/favicon/favicon.ico',
  customCssUrl: undefined,
  // TODO: Replace with your support email address
  supportEmail: 'support@example.com',
  documentationUrl: undefined,
  termsUrl: undefined,
  privacyUrl: undefined,
  theme: {
    primaryColor: '#701ffc',
    primaryHoverColor: '#802fff',
    accentColor: '#9d54ff',
    accentHoverColor: '#a66fff',
    backgroundColor: '#0c0c0c',
  },
  geo: {
    // TODO: Replace with your product's AI description and keywords
    aiDescription: 'A production-ready Next.js SaaS boilerplate with auth, payments, and email.',
    primaryKeywords: ['Next.js boilerplate', 'SaaS template', 'open source'],
    socialLinks: {
      github: undefined,
      twitter: undefined,
      discord: undefined,
    },
    softwareCategory: 'DeveloperApplication',
    pricingType: 'Free',
    operatingSystem: 'Any',
  },
}

const getThemeColors = (): ThemeColors => {
  return {
    primaryColor: defaultConfig.theme?.primaryColor,
    primaryHoverColor: defaultConfig.theme?.primaryHoverColor,
    accentColor: defaultConfig.theme?.accentColor,
    accentHoverColor: defaultConfig.theme?.accentHoverColor,
    backgroundColor: defaultConfig.theme?.backgroundColor,
  }
}

export const getBrandConfig = (): BrandConfig => {
  return {
    name: defaultConfig.name,
    logoUrl: defaultConfig.logoUrl,
    faviconUrl: defaultConfig.faviconUrl,
    customCssUrl: defaultConfig.customCssUrl,
    supportEmail: defaultConfig.supportEmail,
    documentationUrl: defaultConfig.documentationUrl,
    termsUrl: defaultConfig.termsUrl,
    privacyUrl: defaultConfig.privacyUrl,
    theme: getThemeColors(),
    geo: defaultConfig.geo,
  }
}

/**
 * @deprecated Use getBrandConfig() directly — this is not a real React hook.
 */
export const useBrandConfig = getBrandConfig
