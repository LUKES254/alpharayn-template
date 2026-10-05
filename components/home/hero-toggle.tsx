'use client'

import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Users, Shield, Sparkles, ArrowRight, Star, Share2 } from 'lucide-react'
import Link from 'next/link'

// Toggle between hero section (false) and waitlist (true)
const SHOW_WAITLIST =false

export function HeroToggle() {
  return (
    <>
      {/* Hero Section - Conditional Rendering */}
      {SHOW_WAITLIST ? (
        <section className="pt-36 pb-28 md:pt-44 md:pb-36 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
               🚀 The Ultimate African SaaS Starter Kit
              <br className="hidden md:block" />

            </h1>
                          <h2 className='text-5xl md:text-4xl font-bold tracking-tight text-gray-600 dark:text-white mb-6'>Launch your SaaS in days </h2>
            <p className="mt-10 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The most convenient way for merchants in Africa to easily accept mobile money, crypto,
              cash payments and third-party wallet services from their customers.
            </p>
            <div className="mt-12 flex items-center justify-center gap-5">
              <Link href="/waitlist" className="inline-flex">
                <Button size="lg" className="h-auto px-10 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg shadow-blue-600/40">
                  Join the waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {/* <Button size="lg" variant="outline" className="h-auto px-6 py-4 rounded-lg">
                Contact sales
              </Button> */}
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary border-primary/20">
                🚀 The Ultimate African SaaS Starter Kit
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
                Launch your SaaS in <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  days, not months
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                The Next.js SaaS Boilerplate for busy African developers, with all you need to build and launch your SaaS soon.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="#pricing">
                  <Button size="lg" className="text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                    Get ideacloner
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                  <span>made for African founders</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
