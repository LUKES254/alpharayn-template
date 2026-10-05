import { PaymentManagement } from "@/components/admin/payment-management"
import { getSession, requireRole } from "@/lib/auth-utils"

export default async function AdminPaymentsPage() {
  await requireRole("admin")
  const session = await getSession()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        <p className="text-gray-600">View and manage all platform payments</p>
      </div>
      <PaymentManagement />
    </div>
  )
}