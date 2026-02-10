import Image from 'next/image'

import { LoginForm } from '@/features/auth/components/login-form'
import { RegisterForm } from '@/features/auth/components/register-form'
import { Card } from '@/features/shared/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'

export default function AuthPage() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center">
      <div className="flex flex-col w-full max-w-sm items-center gap-8">
        <div className={'flex gap-3 items-center'}>
          <Image
            src={'/atlas_logo_rounded_m.png'}
            width={64}
            height={64}
            alt={'Logo'}
          />
          <h1 className="text-4xl font-semibold tracking-tight">Atlas Gym</h1>
        </div>
        <Card className={'w-full p-0'} style={{ minHeight: '250px' }}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full items-center">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <div className="py-6">
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
