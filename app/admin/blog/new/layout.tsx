import { ReactNode } from 'react'
import { requireRole } from '@/lib/auth-utils'

export default async function NewBlogLayout({
  children,
}: {
  children: ReactNode
}) {
  // Ensure user is admin
  await requireRole('admin')
  
  // Return children directly without the dashboard wrapper
  return <>{children}</>
}
