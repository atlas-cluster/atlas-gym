'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface PingResponse {
  status: 'success' | 'error'
  message: string
  timestamp: string
  database?: {
    type: string
    version: string
  }
  error?: string
}

export function DatabaseTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PingResponse | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/db/ping')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Failed to connect to API',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Test your PostgreSQL database connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testConnection}
          disabled={loading}
          className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Database />
              Ping Database
            </>
          )}
        </Button>

        {result && (
          <div
            className={`rounded-lg border p-4 ${
              result.status === 'success'
                ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
                : 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
            }`}>
            <div className="flex items-start gap-3">
              {result.status === 'success' ? (
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <p
                  className={`font-medium ${
                    result.status === 'success'
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                  {result.message}
                </p>
                {result.database && (
                  <div className="text-sm space-y-1">
                    <p className="text-green-800 dark:text-green-200">
                      <span className="font-medium">Database:</span>{' '}
                      {result.database.type}
                    </p>
                    <p className="text-green-800 dark:text-green-200">
                      <span className="font-medium">Version:</span>{' '}
                      {result.database.version}
                    </p>
                  </div>
                )}
                {result.error && (
                  <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                    {result.error}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
