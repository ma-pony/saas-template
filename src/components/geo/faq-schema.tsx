import { getFAQPageSchema } from '@/lib/seo'

interface FaqSchemaProps {
  faqs: Array<{ question: string; answer: string }>
}

const FaqSchema = ({ faqs }: FaqSchemaProps) => {
  const schema = getFAQPageSchema(faqs)

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default FaqSchema
