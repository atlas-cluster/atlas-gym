import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'

import { getSession } from '@/features/auth/actions/get-session'
import { AuthProvider } from '@/features/auth/components/auth-provider'
import { Toaster } from '@/features/shared/components/ui/sonner'
import '@/features/shared/styles/globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Atlas Gym',
  description: 'Gym Management System',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <AuthProvider initialUser={session.user}>
            <Toaster />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
