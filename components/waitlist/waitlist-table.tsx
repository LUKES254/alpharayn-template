'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Mail, Eye } from 'lucide-react'

interface Entry {
  id: string
  email: string
  full_name: string
  referral_count: number
  position: number
  status: string
  joined_at?: string
  priority?: boolean
}

interface Props {
  entries: Entry[]
  onInvite?: (id: string) => void
  onPriority?: (id: string, next: boolean) => void
  onView?: (id: string) => void
}

export function WaitlistTable({ entries, onInvite, onPriority, onView }: Props) {
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Referrals</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-semibold">{e.position}</TableCell>
              <TableCell>{e.email}</TableCell>
              <TableCell>{e.full_name}</TableCell>
              <TableCell>{e.referral_count}</TableCell>
              <TableCell><Badge variant="secondary">{e.status}</Badge></TableCell>
              <TableCell>{e.joined_at ? new Date(e.joined_at).toLocaleDateString() : '-'}</TableCell>
              <TableCell className="flex gap-2 justify-end">
                {onPriority && (
                  <Button variant={e.priority ? 'default' : 'outline'} size="icon" onClick={() => onPriority(e.id, !e.priority)} aria-label="Toggle priority">
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                {onInvite && <Button variant="secondary" size="icon" onClick={() => onInvite(e.id)} aria-label="Invite"><Mail className="h-4 w-4" /></Button>}
                {onView && <Button variant="ghost" size="icon" onClick={() => onView(e.id)} aria-label="View details"><Eye className="h-4 w-4" /></Button>}
              </TableCell>
            </TableRow>
          ))}
          {entries.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No entries yet</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
