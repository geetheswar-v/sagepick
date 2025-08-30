'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverItem } from '@/components/ui/popover'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="w-3.5 h-3.5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const getCurrentIcon = () => {
    if (theme === 'system') return <Monitor className="w-3.5 h-3.5" />
    if (resolvedTheme === 'dark') return <Moon className="w-3.5 h-3.5" />
    return <Sun className="w-3.5 h-3.5" />
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ]

  return (
    <Popover
      trigger={
        <Button variant="outline" size="icon" className="rounded-full">
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
      content={
        <div className="w-40">
          {themeOptions.map((option) => (
            <PopoverItem
              key={option.value}
              icon={option.icon}
              onClick={() => setTheme(option.value)}
              className={theme === option.value ? "bg-accent text-accent-foreground" : ""}
            >
              {option.label}
            </PopoverItem>
          ))}
        </div>
      }
      side="bottom"
      align="end"
    />
  )
}
