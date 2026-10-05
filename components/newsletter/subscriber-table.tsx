'use client'

import { useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Subscriber {
  id: string
  email: string
  status: string
  source?: string
  subscribed_at?: string
}

interface Props {
  subscribers: Subscriber[]
  onExport?: () => void
}

export function SubscriberTable({ subscribers, onExport }: Props) {
  const rows = useMemo(() => subscribers || [], [subscribers])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input placeholder="Search email" className="max-w-sm" />
        <Button variant="outline" onClick={onExport}>Export CSV</Button>
      </div>
      <div className="rounded-lg border bg-white dark:bg-gray-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id || row.email}>
                <TableCell>{row.email}</TableCell>
                <TableCell><Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge></TableCell>
                <TableCell>{row.source || 'website'}</TableCell>
                <TableCell>{row.subscribed_at ? new Date(row.subscribed_at).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No subscribers yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
