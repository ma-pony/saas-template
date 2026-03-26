import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'
import BlogFAQ from './faq'

export const getMDXComponents = (): MDXComponents => ({
  // Map FAQ to the BlogFAQ component for use in MDX
  FAQ: BlogFAQ as any,

  // Headings - IDs are injected by rehype-slug
  h1: ({ children, ...props }) => (
    <h1 className='mt-8 scroll-mt-20 text-3xl font-bold tracking-tight' {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className='mt-8 scroll-mt-20 text-2xl font-semibold tracking-tight' {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className='mt-6 scroll-mt-20 text-xl font-semibold tracking-tight' {...props}>
      {children}
    </h3>
  ),

  // Links
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http') || href?.startsWith('//')
    if (isExternal) {
      return (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary underline underline-offset-4 transition-colors hover:text-primary/80'
          {...props}
        >
          {children}
        </a>
      )
    }
    return (
      <Link
        href={href ?? '#'}
        className='text-primary underline underline-offset-4 transition-colors hover:text-primary/80'
        {...props}
      >
        {children}
      </Link>
    )
  },

  // Images
  img: ({ src, alt, ...props }) => {
    if (!src) return null
    return (
      <span className='my-6 block overflow-hidden rounded-lg border border-[#E4E4E7]'>
        <Image
          src={src}
          alt={alt ?? ''}
          width={800}
          height={450}
          className='w-full object-cover'
          {...(props as any)}
        />
      </span>
    )
  },

  // Code blocks
  pre: ({ children, ...props }) => (
    <pre
      className='my-6 overflow-x-auto rounded-lg border border-[#E4E4E7] bg-[#F4F4F5] p-4 text-sm'
      {...props}
    >
      {children}
    </pre>
  ),

  // Inline code
  code: ({ children, ...props }) => (
    <code
      className='rounded bg-[#F4F4F5] px-1.5 py-0.5 text-sm font-mono text-foreground'
      {...props}
    >
      {children}
    </code>
  ),

  // Blockquote
  blockquote: ({ children, ...props }) => (
    <blockquote
      className='my-6 border-l-4 border-primary pl-4 italic text-muted-foreground'
      {...props}
    >
      {children}
    </blockquote>
  ),
})
