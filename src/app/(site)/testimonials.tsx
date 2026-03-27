'use client'

import Link from 'next/link'
import { FaXTwitter } from 'react-icons/fa6'
import { SiThreads } from 'react-icons/si'
import Image from 'next/image'

export default function Testimonials() {
  // TODO: Replace with your own testimonials
  const testimonials = [
    {
      quote:
        'This template saved us weeks of setup. Auth, payments, and i18n just worked out of the box.',
      name: 'Alex Chen',
      title: 'CTO, Startup Co.',
      avatar: 'AC',
      avatarType: 'initials',
    },
    {
      quote:
        'The adapter pattern for payments is brilliant. We switched from Stripe to Polar by changing one env var.',
      name: 'Sarah Kim',
      title: 'Full-Stack Developer',
      avatar: 'SK',
      avatarType: 'initials',
    },
    {
      quote:
        "I'm not even exaggerating - this saved me weeks of work.\nInstead of fighting errors and configs, I actually built features.",
      name: 'Jordan Lee',
      title: 'Indie Builder',
      avatar: 'JL',
      avatarType: 'initials',
    },
    {
      quote:
        "The best Next.js starter I've used. Production-grade out of the box with SEO, dashboard flow, and multi-language support.",
      name: 'Maria Garcia',
      title: 'Product Engineer',
      avatar: 'MG',
      avatarType: 'initials',
    },
    {
      quote:
        'Started on a Friday night, had a live SaaS by Sunday.\nEverything just clicked - no roadblocks, no setup headaches.',
      name: 'Ryan Park',
      title: 'SaaS Founder',
      avatar: 'RP',
      avatarType: 'initials',
    },
    {
      quote:
        'Finally a template that takes security seriously. Auth, CSRF, rate limiting - all handled properly.',
      name: 'Emma Wilson',
      title: 'Security Engineer',
      avatar: 'EW',
      avatarType: 'initials',
    },
  ]

  return (
    <section id='wall-of-love' className='py-24 bg-[#F4F4F5]'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <h2
          className='text-center text-sm font-medium text-muted-foreground mb-8'
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          TESTIMONIALS
        </h2>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-semibold tracking-tight mb-4'>Trusted by developers</h2>
          <p className='text-lg text-muted-foreground'>
            See what builders are saying about our platform
          </p>
        </div>

        <div className='border border-[#E4E4E7] rounded-none overflow-hidden bg-transparent'>
          <div className='grid grid-cols-2 md:grid-cols-3 auto-rows-auto'>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-4 bg-transparent flex flex-col relative ${
                  index % 3 !== 2 ? 'border-r border-[#E4E4E7]' : ''
                } ${index < 3 ? 'border-b border-[#E4E4E7]' : ''}`}
              >
                {/* Quote */}
                <p className='text-sm text-muted-foreground mb-4 whitespace-pre-line'>
                  "{testimonial.quote}"
                </p>

                {/* Profile */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    {testimonial.avatarType === 'image' ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground'>
                        {testimonial.avatar}
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-semibold text-foreground'>{testimonial.name}</p>
                      <p className='text-xs text-muted-foreground'>{testimonial.title}</p>
                    </div>
                  </div>
                  {testimonial.twitterLink && (
                    <Link
                      href={testimonial.twitterLink}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <FaXTwitter className='h-5 w-5' />
                    </Link>
                  )}
                  {testimonial.threadsLink && (
                    <Link
                      href={testimonial.threadsLink}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <SiThreads className='h-5 w-5' />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
