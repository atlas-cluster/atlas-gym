import Image from 'next/image'
import { LoginForm } from '@/components/login-form'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirect || '/'

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-2">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src={'/atlas_logo_rounded_m.png'}
          width={100}
          height={100}
          alt={'Logo'}
        />
        <LoginForm className="w-full" redirectTo={redirectTo} />
      </div>
    </div>
  )
}
