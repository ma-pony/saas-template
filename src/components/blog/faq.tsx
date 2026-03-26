import type { FAQItem } from '@/lib/blog/types'
import { generateFaqJsonLd } from '@/lib/blog/json-ld'
import JsonLdScript from './json-ld-script'
import BlogFAQInteractive from './faq-interactive'

export interface BlogFAQProps {
  items: FAQItem[]
  mode?: 'interactive' | 'static'
  title?: string
}

const BlogFAQ = ({ items, mode = 'interactive', title }: BlogFAQProps) => {
  const jsonLd = generateFaqJsonLd({ type: 'FAQPage', questions: items })

  if (mode === 'static') {
    return (
      <>
        <JsonLdScript data={jsonLd} />
        <div className='my-8 rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] p-6'>
          {title && <h3 className='mb-4 text-lg font-semibold'>{title}</h3>}
          <dl className='space-y-4'>
            {items.map((item, index) => (
              <div key={index} className='border-b border-[#E4E4E7] pb-4 last:border-b-0 last:pb-0'>
                <dt className='font-medium text-foreground'>{item.question}</dt>
                <dd className='mt-2 text-sm text-muted-foreground'>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </>
    )
  }

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <BlogFAQInteractive items={items} title={title} />
    </>
  )
}

export default BlogFAQ
