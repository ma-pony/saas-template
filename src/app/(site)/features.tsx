'use client'

import { useTranslations } from 'next-intl'

const featureKeys = [
  'authentication',
  'payments',
  'database',
  'uiComponents',
  'analytics',
  'emails',
  'typescript',
  'rateLimiting',
  'vercelAI',
  'i18n',
  'aiTools',
  'andMore',
] as const

type FeatureKey = (typeof featureKeys)[number]

const featureLogos: Record<string, { logo?: string; logos?: string[] }> = {
  authentication: { logo: '/stack-icons/better-auth.svg' },
  payments: { logos: ['/stack-icons/stripe.svg', '/stack-icons/polar.svg'] },
  database: { logos: ['/stack-icons/drizzle-orm.svg', '/stack-icons/prisma.svg'] },
  uiComponents: { logos: ['/stack-icons/tailwindcss.svg', '/stack-icons/radix-ui.svg'] },
  analytics: { logo: '/stack-icons/posthog.svg' },
  emails: { logo: '/stack-icons/resend.svg' },
  typescript: { logo: '/stack-icons/typescript.svg' },
  rateLimiting: { logo: '/stack-icons/upstash.svg' },
  vercelAI: { logo: '/stack-icons/vercel.svg' },
  i18n: {},
  aiTools: {
    logos: [
      '/stack-icons/windsurf.svg',
      '/stack-icons/cursor.svg',
      '/stack-icons/claude.svg',
      '/stack-icons/copilot.svg',
    ],
  },
  andMore: {},
}

export default function Features() {
  const t = useTranslations('site.features')

  return (
    <section id='features' className='py-24 bg-[#F4F4F5]'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <h2
          className='text-center text-sm font-medium text-muted-foreground mb-8'
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          {t('sectionLabel')}
        </h2>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-semibold tracking-tight mb-4'>{t('title')}</h2>
          <p className='text-lg text-muted-foreground'>{t('subtitle')}</p>
        </div>

        <div className='border border-[#E4E4E7] rounded-none overflow-hidden bg-transparent'>
          <div className='grid grid-cols-4 grid-rows-3 h-full'>
            {featureKeys.map((key, index) => {
              const logos = featureLogos[key]
              return (
                <div
                  key={key}
                  className={`p-6 bg-transparent flex flex-col ${
                    index % 4 !== 3 ? 'border-r border-[#E4E4E7]' : ''
                  } ${index < 8 ? 'border-b border-[#E4E4E7]' : ''}`}
                >
                  {logos.logo && !logos.logos && (
                    <div className='mb-3 flex items-center gap-2'>
                      <img
                        src={logos.logo}
                        alt={t(`items.${key}.title`)}
                        className='h-10 w-10 object-contain'
                      />
                    </div>
                  )}
                  {logos.logos && (
                    <div className='mb-3 flex items-center gap-2 flex-wrap'>
                      {logos.logos.map((logo, logoIndex) => (
                        <img
                          key={logoIndex}
                          src={logo}
                          alt={t(`items.${key}.title`)}
                          className={`h-10 w-10 object-contain ${
                            logo.includes('prisma') ? 'brightness-0' : ''
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <h3 className='text-lg font-semibold mb-2'>{t(`items.${key}.title`)}</h3>
                  <p className='text-sm text-muted-foreground'>{t(`items.${key}.description`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
