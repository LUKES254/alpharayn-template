import { Footer } from '@/components/layout/footer'
import { WaitlistForm } from '@/components/waitlist/waitlist-form'
import { WaitlistNav } from '@/components/layout/waitlist-nav'

export const dynamic = 'force-dynamic'

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      {/* Waitlist Navigation */}
      <WaitlistNav />

      {/* Main Content - Takes up 75% of viewport */}
      <section className="flex-1 pt-40 pb-32 px-4 flex items-center" style={{ minHeight: '75vh' }}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Inspirational Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Build Your SaaS
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Faster Than Ever
                  </span>
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  The ultimate Next.js boilerplate designed specifically for African developers. 
                  Launch your SaaS in days, not months.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Lightning Fast Setup</h3>
                    <p className="text-gray-600 dark:text-gray-400">Get your SaaS up and running in minutes with our pre-configured stack.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Built-in Security</h3>
                    <p className="text-gray-600 dark:text-gray-400">Enterprise-grade authentication, RLS policies, and payment integration included.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Africa-First Features</h3>
                    <p className="text-gray-600 dark:text-gray-400">Paystack integration, mobile money support, and localized payment options.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Join <span className="font-bold text-blue-600 dark:text-blue-400">247+ developers</span> already on the waitlist
                </p>
              </div>
            </div>

            {/* Right Side - Form Card */}
            <div className="lg:ml-auto w-full max-w-xl">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-10 shadow-2xl border border-slate-800">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Join the waitlist for our
                  </h2>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    SaaS Boilerplate!
                  </h3>
                </div>
                
                <WaitlistForm />
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🔒 Secure · ⚡ Fast · 🎯 No spam
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
