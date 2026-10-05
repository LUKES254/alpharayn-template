export function DatabaseMockup() {
  return (
    <div className="relative bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 lg:p-12 overflow-hidden border border-purple-100 dark:border-purple-800/30">
      {/* 
        TO ADD YOUR OWN IMAGE:
        <Image 
          src="/images/database-demo.png" 
          alt="Database Feature Preview" 
          width={600} 
          height={400} 
          className="rounded-xl shadow-xl w-full h-auto transform rotate-1 hover:rotate-0 transition-transform duration-500"
        />
      */}
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="px-4 py-2 bg-gray-800 flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <div className="ml-4 text-xs text-gray-400 font-mono">schema.ts</div>
        </div>
        <div className="p-4 space-y-2 font-mono text-xs">
          <div className="text-blue-400">export const <span className="text-yellow-300">users</span> = pgTable('users', {'{'}</div>
          <div className="pl-4 text-white">id: serial('id').primaryKey(),</div>
          <div className="pl-4 text-white">name: text('name'),</div>
          <div className="pl-4 text-white">email: text('email').notNull(),</div>
          <div className="pl-4 text-white">role: text('role').default('user'),</div>
          <div className="text-blue-400">{'}'})</div>
        </div>
      </div>
    </div>
  )
}
