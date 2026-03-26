import * as LabelPrimitive from '@radix-ui/react-label'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'inline-flex items-center gap-2 text-base/4.5 sm:text-sm/4 font-medium',
        className
      )}
      data-slot='label'
      {...props}
    />
  )
}

export { Label }
