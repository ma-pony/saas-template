import { cn } from '@/lib/utils/css'

interface DirectAnswerProps {
  question: string
  answer: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

const DirectAnswer = ({ question, answer, headingLevel = 'h3', className }: DirectAnswerProps) => {
  const Heading = headingLevel

  return (
    <div itemScope itemType='https://schema.org/Question' className={cn(className)}>
      <Heading itemProp='name'>{question}</Heading>
      <div itemScope itemType='https://schema.org/Answer' itemProp='acceptedAnswer'>
        <div itemProp='text'>{answer}</div>
      </div>
    </div>
  )
}

export default DirectAnswer
