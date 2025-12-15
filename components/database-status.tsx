'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { apiClient, ApiError } from '@/lib/api-client'
import { toast } from 'sonner'

interface DbStatus {
  success: boolean
  message: string
  details?: {
    timestamp?: string
    version?: string
  }
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkConnection = async () => {
    setLoading(true)
    try {
      const data = await apiClient.ping() as DbStatus
      setStatus(data)
      if (data.success) {
        toast.success('Database connection successful!')
      } else {
        toast.error('Database connection failed')
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to connect'
      setStatus({
        success: false,
        message: errorMessage,
      })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={checkConnection}
          disabled={loading}
          className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {status && (
          <div
            className={`rounded-lg border p-4 ${
              status.success
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
            <div className="flex items-start gap-2">
              {status.success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    status.success
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                  {status.message}
                </p>
                {status.success && status.details && (
                  <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                    {status.details.timestamp && (
                      <p>
                        <span className="font-medium">Timestamp:</span>{' '}
                        {new Date(status.details.timestamp).toLocaleString()}
                      </p>
                    )}
                    {status.details.version && (
                      <p className="break-all">
                        <span className="font-medium">Version:</span>{' '}
                        {status.details.version}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
