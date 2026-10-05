'use client'

import { Mail, Sparkles } from 'lucide-react'
import { NewsletterSubscribeForm } from '@/components/newsletter/newsletter-subscribe-form'

export function NewsletterCTA() {
  return (
    <section className="bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 dark:from-slate-800 dark:via-gray-800 dark:to-slate-800 py-16 md:py-24 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-gray-300/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-purple-500/10 border border-blue-200 dark:border-purple-500/20">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-purple-300">Stay in the loop</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Get exclusive updates
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md">
              Be the first to know about new features, releases, and insider tips from our team.
            </p>
            <ul className="space-y-2 pt-4">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-200">
                <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-purple-400"></span>
                Weekly product insights
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-200">
                <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-purple-400"></span>
                Early access to features
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-200">
                <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-purple-400"></span>
                No spam, ever
              </li>
            </ul>
          </div>

          {/* Right side - Form */}
          <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/40 dark:border-white/20 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-blue-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscribe now</h3>
            </div>
            <NewsletterSubscribeForm source="newsletter-cta" inline={false} />
          </div>
        </div>
      </div>
    </section>
  )
}
