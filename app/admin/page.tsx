import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Disable caching for admin pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  await requireRole("admin")
  
  // Fetch users from main users table with subscription info
  const { data: users, count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })

  // Fetch auth info
  const { data: authUsers } = await supabaseAdmin
    .from('user')
    .select('id, email_verified, image, created_at')

  // Merge data
  const usersWithAuth = users?.map(user => {
    const authUser = authUsers?.find(au => au.id === user.id)
    return {
      ...user,
      email_verified: authUser?.email_verified || false,
      image: authUser?.image,
      auth_created_at: authUser?.created_at
    }
  })

  // Calculate subscription stats
  const freeUsers = users?.filter(u => u.subscription_tier === 'free').length || 0
  const proUsers = users?.filter(u => u.subscription_tier === 'pro').length || 0
  const premiumUsers = users?.filter(u => u.subscription_tier === 'premium').length || 0

  // Fetch payment stats
  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('amount, status, currency')

  const totalRevenue = payments?.reduce((sum, payment) => 
    payment.status === 'success' ? sum + parseFloat(payment.amount.toString()) : sum, 0
  ) || 0

  const successfulPayments = payments?.filter(p => p.status === 'success').length || 0
  const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0

  // Recent users
  const recentUsers = usersWithAuth?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">System overview and management</p>
      </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{totalUsers || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Free Users</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{freeUsers}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Pro Users</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{proUsers}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Premium Users</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{premiumUsers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(totalRevenue)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Successful Payments</CardDescription>
              <CardTitle className="text-2xl">{successfulPayments}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Pending Payments</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{pendingPayments}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.image && (
                      <img 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{user.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <Badge className={`
                      ${user.subscription_tier === 'free' ? 'bg-gray-500' : ''}
                      ${user.subscription_tier === 'pro' ? 'bg-blue-500' : ''}
                      ${user.subscription_tier === 'premium' ? 'bg-purple-500' : ''}
                      text-white
                    `}>
                      {user.subscription_tier.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${
                      user.email_verified ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {user.email_verified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-center py-4 text-gray-500">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}