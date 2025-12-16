import { Suspense } from 'react'
import Image from 'next/image'
import { LoginForm } from '@/components/login-form'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function LoginFormSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-2">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src={'/atlas_logo_rounded_m.png'}
          width={100}
          height={100}
          alt={'Logo'}
        />
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm className="w-full" />
        </Suspense>
      </div>
    </div>
  )
}
