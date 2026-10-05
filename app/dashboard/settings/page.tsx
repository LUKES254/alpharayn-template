import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth-utils"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { PasswordSettings } from "@/components/settings/password-settings"
import { EmailPreferences } from "@/components/email/email-preferences"
import { DangerZone } from "@/components/settings/danger-zone"
import { User, Shield, Mail, Key, BadgeCheck, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
  const session = await getSession()

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Account Information Summary */}
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Account Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-white border shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account ID</p>
                    <p className="text-sm font-mono font-medium">{session.user.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-white border shadow-sm">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    session.user.emailVerified ? "bg-green-50" : "bg-orange-50"
                  }`}>
                    <BadgeCheck className={`h-5 w-5 ${
                      session.user.emailVerified ? "text-green-600" : "text-orange-600"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                    <p className="text-sm font-medium">
                      {session.user.emailVerified ? (
                        <span className="text-green-600">Verified Account</span>
                      ) : (
                        <span className="text-orange-600">Pending Verification</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Profile Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
            </div>
            <ProfileSettings user={session.user} />
          </section>

          <Separator />

          {/* Password Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold tracking-tight">Security</h2>
            </div>
            <PasswordSettings userId={session.user.id} />
          </section>

          <Separator />

          {/* Email Preferences */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
            </div>
            <EmailPreferences userId={session.user.id} />
          </section>

          <Separator />

          {/* Danger Zone */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-xl font-semibold tracking-tight">Danger Zone</h2>
            </div>
            <DangerZone userId={session.user.id} />
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
