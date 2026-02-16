'use client'

import { useEffect, useMemo, useState } from 'react'
import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

import { executeSQL, getDBSchema } from '@/features/app'
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

// Create a custom theme that matches shadcn colors - defined once outside component
const shadcnTheme = EditorView.theme(
  {
    '&': {
      color: 'hsl(var(--foreground))',
      backgroundColor: 'hsl(var(--background))',
      fontSize: '14px',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
    },
    '.cm-content': {
      caretColor: 'hsl(var(--foreground))',
      padding: '8px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'hsl(var(--foreground))',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'hsl(var(--accent))',
      },
    '.cm-activeLine': {
      backgroundColor: 'hsl(var(--accent) / 0.5)',
    },
    '.cm-gutters': {
      backgroundColor: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
      border: 'none',
      borderTopLeftRadius: 'calc(var(--radius) - 2px)',
      borderBottomLeftRadius: 'calc(var(--radius) - 2px)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'hsl(var(--accent))',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'hsl(var(--muted))',
      border: 'none',
      color: 'hsl(var(--muted-foreground))',
    },
    '.cm-tooltip': {
      border: '1px solid hsl(var(--border))',
      backgroundColor: 'hsl(var(--popover))',
      color: 'hsl(var(--popover-foreground))',
      borderRadius: 'calc(var(--radius) - 2px)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete': {
      '& > ul': {
        fontFamily: 'var(--font-mono)',
        maxHeight: '15em',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
      },
    },
  },
  { dark: false }
)

// Custom syntax highlighting that matches shadcn theme - defined once outside component
const shadcnHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'hsl(var(--primary))' },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: 'hsl(var(--foreground))',
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: 'hsl(var(--primary))',
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: 'hsl(var(--chart-1))',
  },
  { tag: [t.definition(t.name), t.separator], color: 'hsl(var(--foreground))' },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: 'hsl(var(--chart-2))',
  },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: 'hsl(var(--chart-3))',
  },
  { tag: [t.meta, t.comment], color: 'hsl(var(--muted-foreground))' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: 'hsl(var(--primary))', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: 'hsl(var(--primary))' },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: 'hsl(var(--chart-4))',
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: 'hsl(var(--chart-5))',
  },
  { tag: t.invalid, color: 'hsl(var(--destructive))' },
])

export function SQLEditorSheet({ open, onOpenChange }: SQLEditorSheetProps) {
  const [code, setCode] = useState(
    '-- Write your SQL query here\nSELECT * FROM members LIMIT 10;'
  )
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [schema, setSchema] = useState<Record<string, readonly string[]> | null>(null)

  // Fetch database schema for autocomplete
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const dbSchema = await getDBSchema()
        
        // Convert to CodeMirror schema format
        const schemaMap: Record<string, readonly string[]> = {}
        dbSchema.forEach((table) => {
          // Make sure columns are properly typed as readonly array
          schemaMap[table.table] = [...table.columns]
        })
        
        console.log('Schema loaded:', Object.keys(schemaMap))
        setSchema(schemaMap)
      } catch (error) {
        console.error('Failed to load schema:', error)
      }
    }

    if (open) {
      fetchSchema()
    }
  }, [open])

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

  // Create SQL extension with schema autocomplete - memoized to avoid recreating
  const sqlExtension = useMemo(() => {
    if (schema && Object.keys(schema).length > 0) {
      return sql({
        dialect: PostgreSQL,
        schema: schema,
        defaultTable: 'members',
      })
    }
    return sql({ dialect: PostgreSQL })
  }, [schema])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>SQL Editor</SheetTitle>
          <SheetDescription>
            Write and execute raw SQL queries. Use with caution.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Query</label>
            <div className="rounded-md overflow-hidden">
              <CodeMirror
                value={code}
                height="300px"
                extensions={[
                  sqlExtension,
                  shadcnTheme,
                  syntaxHighlighting(shadcnHighlightStyle),
                ]}
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
                <div className="border rounded-md overflow-auto max-h-[500px]">
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
