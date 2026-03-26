import { cn } from '@/lib/utils/css'

interface ComparisonTableProps {
  headers: string[]
  rows: string[][]
  caption?: string
  ariaLabel?: string
  withSchema?: boolean
  className?: string
}

const ComparisonTable = ({
  headers,
  rows,
  caption,
  ariaLabel,
  withSchema = false,
  className,
}: ComparisonTableProps) => {
  const schemaProps = withSchema ? { itemScope: true, itemType: 'https://schema.org/Table' } : {}

  return (
    <div className={cn('overflow-x-auto', className)} {...schemaProps}>
      <table aria-label={ariaLabel} className='min-w-full border border-border text-sm'>
        {caption && <caption className='sr-only'>{caption}</caption>}
        <thead className='bg-muted'>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope='col'
                className='border border-border px-4 py-2 text-left font-semibold'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className='even:bg-muted/50'>
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th
                    key={cellIndex}
                    scope='row'
                    className='border border-border px-4 py-2 text-left font-medium'
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className='border border-border px-4 py-2'>
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
