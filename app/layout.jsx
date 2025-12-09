import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'MyDashboard',
  description: 'Dashboard for Agencies and Contacts',
  icons: {
    icon: '/icon.jpeg',
    shortcut: '/icon.jpeg',
    apple: '/icon.jpeg',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'text-white',
          card: 'shadow-none',
        },
      }}
      localization={{
        signUp: {
          start: {
            title: 'Sign in or create account',
            subtitle: 'Checking your account...',
          }
        },
        signIn: {
          start: {
            title: 'Sign in',
            subtitle: 'Verifying your account...',
          }
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}