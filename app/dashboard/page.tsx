import { DashboardLayout } from "@/components/layout/dashboard-layout"

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        {/* Main dashboard content is now cleared as requested. Access account details via the profile menu in the sidebar. */}
      </div>
    </DashboardLayout>
  )
}