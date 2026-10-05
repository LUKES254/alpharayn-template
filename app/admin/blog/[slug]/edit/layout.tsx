import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export default async function EditBlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  // Check admin role using ADMIN_EMAILS environment variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map((s) => s.trim()) || []
  
  if (!adminEmails.includes(session.user.email)) {
    redirect('/unauthorized')
  }

  return <>{children}</>
}
