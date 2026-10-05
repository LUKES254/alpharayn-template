'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Campaign {
  id: string
  title: string
  status: string
  sent_count?: number
  open_count?: number
  click_count?: number
  created_at?: string
}

interface Props {
  campaigns: Campaign[]
  onDelete?: (id: string) => void
}

export function CampaignTable({ campaigns, onDelete }: Props) {
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Opens</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.title}</TableCell>
              <TableCell><Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
              <TableCell>{c.sent_count ?? 0}</TableCell>
              <TableCell>{c.open_count ?? 0}</TableCell>
              <TableCell>{c.click_count ?? 0}</TableCell>
              <TableCell>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</TableCell>
              <TableCell className="text-right">
                {c.status === 'draft' && onDelete && <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>Delete</Button>}
              </TableCell>
            </TableRow>
          ))}
          {campaigns.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No campaigns</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
