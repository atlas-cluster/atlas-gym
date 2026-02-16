'use client'

import { useState } from 'react'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'
import { PostgreSQL, sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import CodeMirror from '@uiw/react-codemirror'

interface SQLEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface QueryResult {
  success: boolean
  data?: Record<string, unknown>[]
  rowCount?: number
  truncated?: boolean
  error?: string
}

export function SQLEditorSheet({ open, onOpenChange }: SQLEditorSheetProps) {
  const [code, setCode] = useState(
    '-- Write your SQL query here\nSELECT * FROM members LIMIT 10;'
  )
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    setIsExecuting(true)
    setResult({ success: false, error: 'Executing query...' })

    try {
      const queryResult = await executeSQL(code)
      setResult(queryResult)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClear = () => {
    setCode('')
    setResult(null)
  }

  // Get table columns from the first row of data
  const columns =
    result?.success && result.data && result.data.length > 0
      ? Object.keys(result.data[0])
      : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>SQL Editor</SheetTitle>
          <SheetDescription>
            Write and execute raw SQL queries. Use with caution.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Query</label>
            <div className="border rounded-md overflow-hidden">
              <CodeMirror
                value={code}
                height="200px"
                theme={oneDark}
                extensions={[sql({ dialect: PostgreSQL })]}
                onChange={(value) => setCode(value)}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  searchKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Result</label>
                {result.success && result.rowCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {result.rowCount} row{result.rowCount !== 1 ? 's' : ''}{' '}
                    returned
                    {result.truncated && ' (truncated to 100)'}
                  </span>
                )}
              </div>

              {result.success && result.data && result.data.length > 0 ? (
                <div className="border rounded-md overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column} className="font-semibold">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.data.map((row, index) => (
                        <TableRow key={index}>
                          {columns.map((column) => (
                            <TableCell key={column}>
                              {formatCellValue(row[column])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : result.success && result.rowCount !== undefined ? (
                <div className="border rounded-md p-3 bg-muted text-sm">
                  Query executed successfully. {result.rowCount} row
                  {result.rowCount !== 1 ? 's' : ''} affected.
                </div>
              ) : (
                <div className="border rounded-md p-3 bg-destructive/10 text-destructive text-sm">
                  {result.error || 'An error occurred'}
                </div>
              )}

              {result.truncated && (
                <div className="text-sm text-amber-600 dark:text-amber-500">
                  ⚠️ Results truncated to 100 rows. Use LIMIT in your query for
                  specific row counts.
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isExecuting}>
              Clear
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1">
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// Helper function to format cell values for display
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return JSON.stringify(value)
  }
  return String(value)
}
