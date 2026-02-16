'use client'

import { useState } from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism-tomorrow.css'

import { executeSQL } from '@/features/app'
import { Button } from '@/features/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/features/shared/components/ui/sheet'

interface SQLEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SQLEditorSheet({ open, onOpenChange }: SQLEditorSheetProps) {
  const [code, setCode] = useState(
    '-- Write your SQL query here\nSELECT * FROM members LIMIT 10;'
  )
  const [result, setResult] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    setIsExecuting(true)
    setResult('Executing query...')
    
    try {
      const result = await executeSQL(code)
      
      if (result.success) {
        setResult(
          `Query executed successfully.\n\nRows returned: ${result.rowCount}\n\n${JSON.stringify(result.data, null, 2)}`
        )
      } else {
        setResult(`Error: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClear = () => {
    setCode('')
    setResult('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>SQL Editor</SheetTitle>
          <SheetDescription>
            Write and execute raw SQL queries. Use with caution.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Query</label>
            <div className="border rounded-md overflow-hidden bg-[#2d2d2d]">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={(code) => Prism.highlight(code, Prism.languages.sql, 'sql')}
                padding={12}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  minHeight: '200px',
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
                textareaClassName="focus:outline-none"
              />
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Result</label>
              <pre className="border rounded-md p-3 bg-muted text-sm overflow-auto max-h-[300px]">
                {result}
              </pre>
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isExecuting}
            >
              Clear
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1"
            >
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
