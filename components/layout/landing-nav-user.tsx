import Link from "next/link"
import { Button } from "@/components/ui/button"
import { tryGetSession, getUserRoleOptional } from "@/lib/auth-utils"
import { ProfileDropdown } from "./profile-dropdown"

export default async function LandingNavUser() {
  const session = await tryGetSession()
  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/sign-in">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button>Start Free Trial</Button>
        </Link>
      </div>
    )
  }

  const role = await getUserRoleOptional()

  return (
    <ProfileDropdown user={session.user} role={role} />
  )
}
