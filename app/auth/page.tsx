import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm} from '@/components/login-form'

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
        <Card className={"pt-0 w-full"}>
          <Tabs defaultValue="login">
            <TabsList className={"flex mb-8 w-full"}>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm redirectTo={redirectTo}/>
            </TabsContent>
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Register</CardTitle>
              </CardHeader>
            </TabsContent>
          </Tabs>

        </Card>
      </div>
    </div>
  )
}
