import { Image } from "lucide-react" // Placeholder import if needed, but we are using divs mostly.

export function LandingPageMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/landing-page.png" 
          alt="Landing Page Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto transform rotate-2 hover:rotate-0 transition-transform duration-500"
        />
      */}
      
      {/* Current CSS Mockup */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-primary/20 rounded w-1/3 mt-4"></div>
        </div>
      </div>
    </div>
  )
}
