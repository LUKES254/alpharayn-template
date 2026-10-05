import { createClient } from '@/lib/supabase/client'
import { getUserRoleOptional } from '@/lib/auth-utils'

export async function getEffectiveSubscriptionTier(userId: string, fallback: 'free'|'pro'|'premium'='free') {
  const role = await getUserRoleOptional()
  if (role === 'admin') return 'premium'
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()
  return (data?.subscription_tier as 'free'|'pro'|'premium') || fallback
}
