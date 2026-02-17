'use client'

import type React from 'react'
import { useState, useRef, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/features/shared/components/ui/sheet'

interface ResizableSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'left' | 'right'
  children?: React.ReactNode
  title?: string
  description?: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function ResizableSheet({
  open,
  onOpenChange,
  side = 'right',
  children,
  title = 'Resizable Sheet',
  description,
  defaultWidth = 400,
  minWidth = 300,
  maxWidth = 1200,
}: ResizableSheetProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX =
          side === 'left'
            ? e.clientX - startXRef.current // Add for left side
            : startXRef.current - e.clientX // Subtract for right side
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, startWidthRef.current + deltaX)
        )
        setWidth(newWidth)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [width, side, minWidth, maxWidth]
  )

  const handlePosition = side === 'left' ? 'right-0' : 'left-0'
  const borderClass = side === 'left' ? 'border-r' : 'border-l'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="overflow-y-auto p-0"
        style={{ width: `${width}px`, maxWidth: `${width}px` }}>
        {/* Resize Handle */}
        <div
          className={`absolute ${handlePosition} top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 ${
            isResizing ? 'bg-primary/20' : ''
          } z-50`}
          onMouseDown={handleMouseDown}
        />

        {/* Content */}
        <div className="h-full flex flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
