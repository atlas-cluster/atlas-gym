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
      <div className="flex flex-col min-h-screen w-full max-w-sm items-center gap-8">
        <div style={{ height: 100 }} />
        <Image
          src={'/atlas_logo_rounded_m.png'}
          width={100}
          height={100}
          alt={'Logo'}
        />
        <Card className={'w-full p-0'} style={{ minHeight: '250px' }}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full items-center">
              <TabsTrigger value="login" className="flex-1">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Register
              </TabsTrigger>
            </TabsList>
            <div className="py-6">
              <TabsContent value="login" className="mt-0">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register" className="mt-0">
                <RegisterForm />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
        <div style={{ height: 100 }} />
      </div>
    </div>
  )
}
