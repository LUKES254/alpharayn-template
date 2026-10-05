import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { requireRole } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Disable caching for admin pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminUsersPage() {
  await requireRole("admin")
  
  // Fetch all users with their subscription info from the users table
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      email,
      name,
      subscription_tier,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  // Fetch email verification status from Better Auth user table
  const { data: authUsers } = await supabaseAdmin
    .from('user')
    .select('id, email_verified, image')

  // Merge auth data with users data
  const usersWithAuth = users?.map(user => {
    const authUser = authUsers?.find(au => au.id === user.id)
    return {
      ...user,
      email_verified: authUser?.email_verified || false,
      image: authUser?.image
    }
  })

  // Categorize users by subscription
  const freeUsers = usersWithAuth?.filter(u => u.subscription_tier === 'free') || []
  const proUsers = usersWithAuth?.filter(u => u.subscription_tier === 'pro') || []
  const premiumUsers = usersWithAuth?.filter(u => u.subscription_tier === 'premium') || []

  const getTierBadgeColor = (tier: string) => {
    switch(tier) {
      case 'free': return 'bg-gray-500'
      case 'pro': return 'bg-blue-500'
      case 'premium': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const renderUserTable = (usersList: typeof usersWithAuth, title: string, count: number) => (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({count})</CardTitle>
        <CardDescription>Users on the {title.toLowerCase()} plan</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || 'N/A'}
                  {user.image && (
                    <img 
                      src={user.image} 
                      alt={user.name || 'User'} 
                      className="w-6 h-6 rounded-full inline ml-2"
                    />
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={`${getTierBadgeColor(user.subscription_tier)} text-white`}>
                    {user.subscription_tier.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.email_verified ? "default" : "secondary"}>
                    {user.email_verified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(user.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
              </TableRow>
            ))}
            {(!usersList || usersList.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600">View and manage all registered users</p>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{usersWithAuth?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Free Users</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{freeUsers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pro Users</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{proUsers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Premium Users</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{premiumUsers.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* All Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({usersWithAuth?.length || 0})</CardTitle>
            <CardDescription>Complete list of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithAuth?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || 'N/A'}
                      {user.image && (
                        <img 
                          src={user.image} 
                          alt={user.name || 'User'} 
                          className="w-6 h-6 rounded-full inline ml-2"
                        />
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${getTierBadgeColor(user.subscription_tier)} text-white`}>
                        {user.subscription_tier.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.email_verified ? "default" : "secondary"}>
                        {user.email_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {!usersWithAuth || usersWithAuth.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Premium Users */}
        {premiumUsers.length > 0 && renderUserTable(premiumUsers, 'Premium Users', premiumUsers.length)}
        
        {/* Pro Users */}
        {proUsers.length > 0 && renderUserTable(proUsers, 'Pro Users', proUsers.length)}
        
        {/* Free Users */}
        {freeUsers.length > 0 && renderUserTable(freeUsers, 'Free Users', freeUsers.length)}
      </div>
  )
}
