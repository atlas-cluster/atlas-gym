import Image from 'next/image'
import { RegisterForm } from '@/components/register-form'

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
        <RegisterForm className="w-full" />
      </div>
    </div>
  )
}
