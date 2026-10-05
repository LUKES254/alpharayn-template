export function AuthMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/auth-demo.png" 
          alt="Authentication Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto transform rotate-2 hover:rotate-0 transition-transform duration-500"
        />
      */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="text-center mb-6">
          <div className="h-10 w-10 bg-primary/20 rounded-full mx-auto mb-3"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 mx-auto rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-50 dark:bg-gray-900 border rounded"></div>
          <div className="h-10 bg-primary text-white rounded flex items-center justify-center text-sm font-medium">Sign In</div>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div className="flex gap-2 justify-center">
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700"></div>
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
