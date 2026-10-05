import { Mail, Check, Zap } from "lucide-react"

export function EmailMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/email-demo.png" 
          alt="Email Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto transform -rotate-1 hover:rotate-0 transition-transform duration-500"
        />
      */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm mx-auto space-y-3 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
           <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
             <Mail className="h-4 w-4" />
           </div>
           <div className="flex-1">
             <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
             <div className="h-2 w-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
           </div>
           <Check className="h-4 w-4 text-green-500" />
        </div>
        <div className="flex justify-center">
           <div className="h-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
             <Zap className="h-4 w-4" />
           </div>
           <div className="flex-1">
             <div className="h-2 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
             <div className="h-2 w-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
           </div>
        </div>
      </div>
    </div>
  )
}
