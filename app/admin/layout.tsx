import { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
