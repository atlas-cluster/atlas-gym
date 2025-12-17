import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { LoginForm } from '@/components/login-form'
import { RegisterForm } from '@/components/register-form'

export default async function Page({
                                     searchParams,
                                   }: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirect || '/'

  return (
    <div className="flex min-h-screen w-full justify-center p-2 items-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src={'/atlas_logo_rounded_m.png'}
          width={100}
          height={100}
          alt={'Logo'}
        />
        <div className={"min-h-[500px] w-full"}>
          <Card className={'w-full pt-0'}>
            <Tabs defaultValue="login">
              <TabsList className={'mb-8 flex w-full'}>
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm redirectTo={redirectTo} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
