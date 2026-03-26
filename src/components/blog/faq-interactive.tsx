'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion'
import type { FAQItem } from '@/lib/blog/types'

interface BlogFAQInteractiveProps {
  items: FAQItem[]
  title?: string
}

const BlogFAQInteractive = ({ items, title }: BlogFAQInteractiveProps) => {
  return (
    <div className='my-8 rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] p-6'>
      {title && <h3 className='mb-4 text-lg font-semibold'>{title}</h3>}
      <Accordion type='single' collapsible className='space-y-0'>
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={String(index)}
            className='border-b border-[#E4E4E7] last:border-b-0'
          >
            <AccordionTrigger className='text-left py-4 text-base font-medium hover:no-underline'>
              {item.question}
            </AccordionTrigger>
            <AccordionPanel className='text-muted-foreground text-sm pb-4'>
              {item.answer}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default BlogFAQInteractive
