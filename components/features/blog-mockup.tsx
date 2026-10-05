export function BlogMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/blog-demo.png" 
          alt="Blog Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500"
        />
      */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
           <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">B</div>
           <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="p-6">
          <div className="h-6 w-3/4 bg-gray-800 dark:bg-white rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div className="h-2 w-2/3 bg-gray-100 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
