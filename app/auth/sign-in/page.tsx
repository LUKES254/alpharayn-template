import { AuthForm } from "@/components/auth/auth-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <AuthForm mode="sign-in" />
    </div>
  )
}