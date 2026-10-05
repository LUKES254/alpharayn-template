'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Map, Settings, Users, Sparkles, Code } from 'lucide-react'

interface FeatureCard {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
}

const cards: FeatureCard[] = [
  {
    id: 1,
    title: 'Personalized Learning Path',
    description: 'A clear, step-by-step roadmap tailored to your current skills and the role you want to achieve.',
    icon: <Map className="h-8 w-8" />,
    bgColor: 'bg-black',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: 'Project-Based Learning',
    description: 'Build real-world projects that showcase your skills and help you learn by doing.',
    icon: <Settings className="h-8 w-8" />,
    bgColor: 'bg-purple-200',
    textColor: 'text-gray-900',
  },
  {
    id: 3,
    title: '1:1 Mentorship',
    description: 'Get personalized guidance from experienced developers who understand your journey.',
    icon: <Users className="h-8 w-8" />,
    bgColor: 'bg-yellow-400',
    textColor: 'text-gray-900',
  },
  {
    id: 4,
    title: 'Daily Challenges',
    description: 'Stay motivated with AI-powered daily coding challenges that match your skill level.',
    icon: <Sparkles className="h-8 w-8" />,
    bgColor: 'bg-purple-600',
    textColor: 'text-white',
  },
  {
    id: 5,
    title: 'Code Reviews',
    description: 'Receive detailed feedback on your code from industry professionals to improve faster.',
    icon: <Code className="h-8 w-8" />,
    bgColor: 'bg-pink-400',
    textColor: 'text-gray-900',
  },
]

export default function AnimatedFeatureCards() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationDuration = 60 // seconds - slowed down for better UX
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Animate scrollLeft for ping-pong effect
  useEffect(() => {
    if (!scrollRef.current) return
    const scrollContainer = scrollRef.current
    let direction = 1 // 1: right-to-left, -1: left-to-right
    let req: number
    let start: number | null = null
    // Calculate maxScroll dynamically
    let maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
    let duration = animationDuration * 1000
    let animating = true
    let from = scrollContainer.scrollLeft
    let target = direction === 1 ? maxScroll : 0

    // Update maxScroll on resize
    const updateDimensions = () => {
      maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
      if (direction === 1) target = maxScroll
    }
    window.addEventListener('resize', updateDimensions)

    function step(ts: number) {
      if (!animating) return
      if (start === null) start = ts
      const elapsed = ts - start
      const percent = Math.min(elapsed / duration, 1)
      
      // If user is scrolling, update 'from' to current position to avoid jump when resuming
      if (isUserScrolling) {
        start = null
        from = scrollContainer.scrollLeft
        return (req = requestAnimationFrame(step))
      }

      let scrollPos = from + (target - from) * percent
      scrollContainer.scrollLeft = scrollPos

      if (percent < 1) {
        req = requestAnimationFrame(step)
      } else {
        direction *= -1
        start = null
        from = scrollContainer.scrollLeft
        target = direction === 1 ? maxScroll : 0
        req = requestAnimationFrame(step)
      }
    }
    
    req = requestAnimationFrame(step)
    
    return () => {
      animating = false
      if (req) cancelAnimationFrame(req)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [isUserScrolling, animationDuration])

  // Pause animation while user scrolls, resume after delay
  const handleScroll = () => {
    setIsUserScrolling(true)
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 2000) // Longer pause for better UX
  }

  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const handleCardHover = (cardId: number) => {
    setExpandedCards((prev) => new Set(prev).add(cardId))
  }

  const handleCardLeave = (cardId: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      newSet.delete(cardId)
      return newSet
    })
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Side - Heading */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              What you'll get
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              In 5 Easy Steps
            </h3>
          </div>
        </div>

        {/* Cards Container */}
        {/* Mobile: horizontal scroll with animation, Desktop: original flex */}
        <div className="relative mb-8">
          {/* Mobile/Tablet: horizontal scroll and animation */}
          <div className="block lg:hidden">
            <div className="relative w-full h-96 overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-4 h-96 overflow-x-auto scrollbar-hide scroll-smooth w-full"
                onScroll={handleScroll}
              >
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`
                      ${card.bgColor} ${card.textColor}
                      w-72 h-96
                      rounded-3xl
                      p-6
                      flex flex-col justify-between
                      flex-shrink-0
                      cursor-pointer
                    `}
                  >
                    <div className="text-sm font-semibold opacity-70">0{card.id}</div>
                    <div className="flex justify-center my-8">{card.icon}</div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold leading-tight">{card.title}</h3>
                      <p className="text-sm opacity-90 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden lg:flex gap-4 h-96">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`
                  ${card.bgColor} ${card.textColor}
                  relative
                  rounded-3xl
                  p-6
                  flex flex-col justify-between
                  cursor-pointer
                  transition-all duration-500 ease-in-out
                  ${expandedCards.has(card.id) ? 'flex-[3]' : 'flex-1'}
                `}
                onMouseEnter={() => handleCardHover(card.id)}
                onMouseLeave={() => handleCardLeave(card.id)}
              >
                <div className="text-sm font-semibold opacity-70">0{card.id}</div>
                <div className="flex justify-center my-auto transition-all duration-500">
                  {card.icon}
                </div>
                
                <div className={`space-y-3 transition-all duration-500 overflow-hidden ${expandedCards.has(card.id) ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0'}`}>
                  <h3 className="text-lg font-bold leading-tight whitespace-nowrap">{card.title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed min-w-[200px]">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learn More Button */}
        <div className="flex justify-center">
          <button className="flex items-center gap-2 bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 rounded-full hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors">
            <span>Learn More</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        /* Hide scrollbar for mobile horizontal scroll */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for mobile horizontal scroll */
      `}</style>
    </div>
  )
}
