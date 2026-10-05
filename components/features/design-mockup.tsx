export function DesignMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/design-demo.png" 
          alt="Design Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto"
        />
      */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="h-8 w-8 rounded-full bg-primary mb-3"></div>
          <div className="h-2 w-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="h-8 w-20 bg-primary rounded-md mb-3"></div>
          <div className="h-2 w-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700"></div>
            <div className="space-y-1">
              <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-2 w-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-primary/10 rounded text-primary text-xs flex items-center justify-center">Follow</div>
        </div>
      </div>
    </div>
  )
}
