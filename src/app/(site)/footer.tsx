'use client'

import Link from 'next/link'
import { FaGithub, FaDiscord, FaXTwitter } from 'react-icons/fa6'
import { SiProducthunt, SiYcombinator, SiPeerlist } from 'react-icons/si'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function Footer() {
  const t = useTranslations('site.footer')
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <footer aria-label='Site footer' className='border-t border-[#E4E4E7] bg-[#F4F4F5] py-12'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
          {/* Column 1: Links */}
          <div>
            <h3
              className='mb-4 text-sm font-semibold uppercase'
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {t('links.heading')}
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href={`/${locale}/#pricing`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('links.pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/docs`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('links.docs')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/changelog`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('links.changelog')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/demo`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('links.demo')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('links.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal */}
          <div>
            <h3
              className='mb-4 text-sm font-semibold uppercase'
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {t('legal.heading')}
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('legal.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/licenses`}
                  className='text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  {t('legal.licenses')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured On */}
          <div>
            <h3
              className='mb-4 text-sm font-semibold uppercase'
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {t('featuredOn.heading')}
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='https://www.producthunt.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <SiProducthunt className='h-4 w-4' />
                  Product Hunt
                </Link>
              </li>
              <li>
                <Link
                  href='https://news.ycombinator.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <SiYcombinator className='h-4 w-4' />
                  Hacker News
                </Link>
              </li>
              <li>
                <Link
                  href='https://peerlist.io'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <SiPeerlist className='h-4 w-4' />
                  Peerlist
                </Link>
              </li>
              <li>
                <Link
                  href='https://github.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <FaGithub className='h-4 w-4' />
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Community */}
          <div>
            <h3
              className='mb-4 text-sm font-semibold uppercase'
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {t('community.heading')}
            </h3>
            <ul className='space-y-3'>
              <li>
                {/* TODO: Replace with your GitHub repository URL */}
                <Link
                  href='https://github.com/your-org/your-repo'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <FaGithub className='h-4 w-4' />
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href='https://discord.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <FaDiscord className='h-4 w-4' />
                  Discord
                </Link>
              </li>
              <li>
                {/* TODO: Replace with your Twitter/X profile URL */}
                <Link
                  href='https://x.com/yourhandle'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground'
                >
                  <FaXTwitter className='h-4 w-4' />X
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='mt-12 pt-8 border-t border-[#E4E4E7]'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              {/* TODO: Replace /image.png with your logo file */}
              <img src='/image.png' alt='App Logo' className='h-6 w-6 object-contain' />
              <span
                className='text-base font-semibold text-foreground'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {/* TODO: Replace with your app name */}
                My App
              </span>
            </div>
            {/* TODO: Replace with your product tagline */}
            <p className='text-sm text-muted-foreground'>{t('tagline')}</p>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-muted-foreground'>
                {/* TODO: Replace with your company name and website */}
                {t('copyright', { year: new Date().getFullYear() })} Your Company
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
