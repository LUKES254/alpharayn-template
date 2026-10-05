'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WaitlistHero() {
  return (
    <section className="pt-36 pb-28 md:pt-44 md:pb-36 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-7xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
           🚀 The Ultimate African SaaS Starter Kit
          <br className="hidden md:block" />
          
        </h1>
        <h2 className='text-5xl md:text-3xl font-bold tracking-tight text-gray-600 dark:text-white mb-6'>Launch your SaaS in days </h2>
        <p className="mt-10 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          The most convenient way for merchants in Africa to easily accept mobile money, crypto,
          cash payments and third-party wallet services from their customers.
        </p>
        <div className="mt-12 flex items-center justify-center gap-5">
          <Button
            asChild
            size="lg"
            className="h-auto px-10 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg shadow-blue-600/40"
          >
            <Link href="/waitlist" className="inline-flex items-center">
              Join the waitlist
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          {/* <Button size="lg" variant="outline" className="h-auto px-6 py-4 rounded-lg">
            Contact sales
          </Button> */}
        </div>
      </div>
    </section>
  )
}
