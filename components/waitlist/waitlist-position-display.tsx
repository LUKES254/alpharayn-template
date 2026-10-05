'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

interface Props {
  position: number
  referralCount: number
}

export function WaitlistPositionDisplay({ position, referralCount }: Props) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let frame: number
    const duration = 600
    const start = performance.now()
    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      setCount(Math.floor(progress * position))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [position])

  const pct = Math.min(100, Math.max(0, 100 - position))

  return (
    <div className="space-y-3">
      <div className="text-4xl font-bold">#{count || position} in line</div>
      <Progress value={pct} />
      <div className="text-sm text-muted-foreground">You referred {referralCount} {referralCount === 1 ? 'person' : 'people'}.</div>
    </div>
  )
}
