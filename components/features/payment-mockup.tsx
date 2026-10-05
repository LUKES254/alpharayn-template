export function PaymentMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/payments-demo.png" 
          alt="Payments Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500"
        />
      */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="font-bold">Payment Details</div>
          <div className="text-primary font-bold">$49.00</div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Card Number</div>
            <div className="h-10 bg-gray-50 dark:bg-gray-900 border rounded flex items-center px-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Expiry</div>
              <div className="h-10 bg-gray-50 dark:bg-gray-900 border rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">CVC</div>
              <div className="h-10 bg-gray-50 dark:bg-gray-900 border rounded"></div>
            </div>
          </div>
          <div className="h-10 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center font-bold text-sm">
            Pay Now
          </div>
        </div>
      </div>
    </div>
  )
}
