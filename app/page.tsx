import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
const AnimatedFeatureCards = dynamic(() => import("@/components/animated-feature-cards"), { ssr: false })
import { 
  ArrowRight,
  ArrowDown, 
  CreditCard, 
  Shield, 
  Zap, 
  Users, 
  Check, 
  Star, 
  Layout, 
  Mail, 
  Database, 
  Palette, 
  FileText, 
  BarChart, 
  Sparkles,
  Lock
} from "lucide-react"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { NewsletterCTA } from "@/components/newsletter/newsletter-cta"
import { HeroToggle } from "@/components/home/hero-toggle"
import { NavToggle } from "@/components/layout/nav-toggle"
import { LandingPageMockup } from "@/components/features/landing-page-mockup"
import { PaymentMockup } from "@/components/features/payment-mockup"
import { AuthMockup } from "@/components/features/auth-mockup"
import { EmailMockup } from "@/components/features/email-mockup"
import { DatabaseMockup } from "@/components/features/database-mockup"
import { DesignMockup } from "@/components/features/design-mockup"
import { BlogMockup } from "@/components/features/blog-mockup"
import { PricingCard } from "@/components/home/pricing-card"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors font-sans">
      {/* Navigation with Toggle */}
      <NavToggle />

      {/* Hero Section with Toggle */}
      <HeroToggle />

      {/* Animated Feature Cards Section */}
      <AnimatedFeatureCards />

      {/* Features Section - Zig Zag Layout */}
      <section id="features" className="py-32 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              You don&apos;t need to <br className="hidden md:block" />
              code everything yourself.
            </h2>
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-purple-600 animate-bounce" />
            </div>
          </div>

          <div className="space-y-32">
            {/* Feature 1: Landing Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl mb-6">
                  <Layout className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Landing pages</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Composable and customizable pages, with all you need to showcase and sell your product.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Landing page",
                    "Waitlist",
                    "Pre-sale",
                    "Affiliate program page"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  20 HOURS SAVED
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <LandingPageMockup />
              </div>
            </div>

            {/* Feature 2: Collect Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-1 lg:order-1">
                <PaymentMockup />
              </div>
              <div className="order-2 lg:order-2">
                <div className="inline-flex items-center justify-center p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl mb-6">
                  <CreditCard className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Collect payments</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Start accepting payments (subscriptions and one-time) in minutes. Powered by Paystack.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Subscriptions & One-time",
                    "Mobile Money & Cards",
                    "Webhooks ready-to-use",
                    "Pricing page"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4">
                  <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    4 HOURS SAVED
                  </div>
                  <span className="text-sm text-gray-500">Powered by Paystack</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Sign-up & Login */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-6">
                  <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign-up & Login</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  User authentication finally made easy with BetterAuth. Secure and production-ready.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Sign up & Login pages",
                     " magic link sign up ",
                    "Social Auth (Google, GitHub)",
                    "Save user on the database",
                    "Private API calls & private section"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4">
                  <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    10 HOURS SAVED
                  </div>
                  <span className="text-sm text-gray-500">Powered by BetterAuth</span>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <AuthMockup />
              </div>
            </div>

            {/* Feature 4: Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-1 lg:order-1">
                <EmailMockup />
              </div>
              <div className="order-2 lg:order-2">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mb-6">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Email</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Create your product newsletter and send transactional emails with Resend.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "React Email templates",
                    "Welcome emails",
                    "Drip campaigns",
                    "Newsletter system"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  6 HOURS SAVED
                </div>
              </div>
            </div>

            {/* Feature 5: Database ORM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-6">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Database ORM</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Use your favorite database. With Supabase and Drizzle, you don&apos;t need to know SQL.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Postgres (Supabase)",
                    "Drizzle ORM",
                    "Type-safe schema",
                    "Simplified data transactions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  10 HOURS SAVED
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <DatabaseMockup />
              </div>
            </div>

            {/* Feature 6: Design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-1 lg:order-1">
                <DesignMockup />
              </div>
              <div className="order-2 lg:order-2">
                <div className="inline-flex items-center justify-center p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl mb-6">
                  <Palette className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Design</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Elegant and modern UI/UX components to build your SaaS, quickly and effectively.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Tailwind CSS",
                    "shadcn/ui components",
                    "Dark mode included",
                    "Customizable theme"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  18 HOURS SAVED
                </div>
              </div>
            </div>

            {/* Feature 7: Blog */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-6">
                  <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Rank higher on Google with the right content and SEO optimization.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "MDX support",
                    "SEO meta tags",
                    "Sitemap generation",
                    "Easy pages meta tags"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  6 HOURS SAVED
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <BlogMockup />
              </div>
            </div>

            <div className="text-center pt-16">
              <p className="inline-flex items-center justify-center text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 px-8 py-4">
                <Sparkles className="h-8 w-8 mr-3 text-green-500" />
                107+ hours saved including debbugging!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">I love builders, you&apos;ll love ideacloner ❤️</h2>
            <p className="text-gray-600 dark:text-gray-400">Join hundreds of African developers shipping faster.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Tunde A.",
                role: "Founder @ TechNaija",
                content: "ideacloner saved me weeks of work. The Paystack integration worked out of the box!",
                avatar: "T"
              },
              {
                name: "Sarah K.",
                role: "Indie Hacker",
                content: "Finally a boilerplate that understands the African context. Mobile money support is a game changer.",
                avatar: "S"
              },
              {
                name: "Emmanuel O.",
                role: "Software Engineer",
                content: "The code quality is top notch. Clean, well-documented, and easy to extend.",
                avatar: "E"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    &quot;{testimonial.content}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Save weeks of coding with ideacloner.
              <br />
              <span className="text-primary">Earn your first dollars today.</span>
            </h2>
          </div>
          
          <PricingCard />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>What do I get for my money?</AccordionTrigger>
              <AccordionContent className="px-2">
                <p>ideacloner is available as a one-time-purchase that will give you lifetime access to the GitHub repository that contains the Next.js 14 boilerplate code with all you need to run your SaaS online. It supports App Router and the code base is in TypeScript (but you can get rid of it if you prefer JavaScript).</p>
                <br />
                <p>You also get access to the public documentation to get started and that explains in details how to implement the different features (authentication, payments, etc), how to use the different components, and how to deploy your app.</p>
                
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What am I allowed to do with the boilerplate?</AccordionTrigger>
              <AccordionContent className="px-2">
                You are allowed to build unlimited projects with ideacloner (commercial projects too). You are also not allowed to publish the code or parts of it as a template or boilerplate. See the terms and conditions page for more details.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it a template?</AccordionTrigger>
              <AccordionContent className="px-2">
                <p>It&apos;s much more. You&apos;ll get a set of reusable React components and TypeScript business logic code, to build your SaaS quickly.</p>
                <br />
                <p>The components include all the basic UI components like buttons, forms, inputs, modals, navigation (coming from shadcn/ui). But ideacloner provides additional product-oriented components, like: hero section, pricing plans, wait list, testimonials, account menu, call to action, and many more (check them all on the documentation).</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I get a refund?</AccordionTrigger>
              <AccordionContent className="px-2">
                After you get access to the repo, ideacloner is yours forever, so it can&apos;t be refunded.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary/5 dark:bg-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ship your SaaS in days <br />
            and start selling.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Save weeks of coding with the #1 Next.js SaaS Boilerplate for Africa.
          </p>
          <Link href="#pricing">
            <Button size="lg" className="text-lg px-10 py-6 h-auto rounded-xl shadow-xl">
              Get ideacloner
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <NewsletterCTA />
      <Footer />
    </div>
  )
}
