'use client'

interface ReferralNode {
  id: string
  email: string
  full_name?: string
  referral_count?: number
  children?: ReferralNode[]
}

interface Props {
  user: ReferralNode
  referrals: ReferralNode[]
}

export function ReferralTree({ user, referrals }: Props) {
  return (
    <div className="space-y-2">
      <div className="font-semibold">{user.full_name || user.email}</div>
      <div className="pl-4 border-l space-y-2">
        {referrals.length === 0 && <div className="text-sm text-muted-foreground">No referrals yet</div>}
        {referrals.map((child) => (
          <div key={child.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{child.full_name || child.email}</span>
              <span className="text-xs text-muted-foreground">{child.referral_count || 0} refs</span>
            </div>
            {child.children && child.children.length > 0 && (
              <div className="pl-4 border-l">
                {child.children.map((g) => (
                  <div key={g.id} className="text-xs text-muted-foreground">{g.full_name || g.email}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
