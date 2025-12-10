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
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

type HealthStatus = {
  status: string
  database: string
  timestamp?: string
  healthCheckId?: number
  error?: string
}

export function DbTestCard() {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Failed to connect',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection
        </CardTitle>
        <CardDescription>
          Test the PostgreSQL database connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {status && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 ${
              status.status === 'ok'
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
            {status.status === 'ok' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  status.status === 'ok' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                {status.status === 'ok'
                  ? 'Connection Successful'
                  : 'Connection Failed'}
              </p>
              {status.status === 'ok' ? (
                <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                  <p>Database: {status.database}</p>
                  <p>
                    Timestamp:{' '}
                    {status.timestamp
                      ? new Date(status.timestamp).toLocaleString()
                      : 'N/A'}
                  </p>
                  <p>Health Check ID: {status.healthCheckId}</p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {status.error}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
