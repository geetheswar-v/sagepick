'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  className?: string
  contentClassName?: string
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

export function Popover({
  trigger,
  content,
  side = 'bottom',
  align = 'center',
  className,
  contentClassName,
  onOpenChange,
  defaultOpen = false,
}: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const handleToggle = React.useCallback(() => {
    const newOpen = !isOpen
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }, [isOpen, onOpenChange])

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClose])

  const getContentPosition = () => {
    const positions = {
      top: {
        bottom: '100%',
        marginBottom: '4px',
      },
      bottom: {
        top: '100%',
        marginTop: '4px',
      },
      left: {
        right: '100%',
        marginRight: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
      },
      right: {
        left: '100%',
        marginLeft: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
      },
    }

    const alignments = {
      start: side === 'top' || side === 'bottom' ? { left: 0 } : { top: 0 },
      center:
        side === 'top' || side === 'bottom'
          ? { left: '50%', transform: 'translateX(-50%)' }
          : { top: '50%', transform: 'translateY(-50%)' },
      end: side === 'top' || side === 'bottom' ? { right: 0 } : { bottom: 0 },
    }

    return {
      ...positions[side],
      ...alignments[align],
    }
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div ref={triggerRef} onClick={handleToggle}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={contentRef}
          className={cn(
            'absolute z-50 min-w-32 rounded-md border bg-popover text-popover-foreground shadow-md',
            'transform transition-all duration-150 ease-in-out',
            'animate-in fade-in-0 zoom-in-98 slide-in-from-top-1',
            contentClassName
          )}
          style={getContentPosition()}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export interface PopoverItemProps extends React.ComponentProps<'div'> {
  icon?: React.ReactNode
  children: React.ReactNode
}

export function PopoverItem({ 
  icon, 
  children, 
  className, 
  onClick,
  ...props 
}: PopoverItemProps) {
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground m-1',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
      {children}
    </div>
  )
}
