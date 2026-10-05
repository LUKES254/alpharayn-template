"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import dynamic from "next/dynamic"

// Load lucide icons dynamically on the client to avoid SSR/module interop issues
const Search = dynamic(() => import("lucide-react").then((mod) => mod.Search), { ssr: false })
const RefreshCw = dynamic(() => import("lucide-react").then((mod) => mod.RefreshCw), { ssr: false })
const Edit = dynamic(() => import("lucide-react").then((mod) => mod.Edit), { ssr: false })
import { PaymentStatusDialog } from "@/components/admin/payment-status-dialog"

interface Payment {
  id: string
  paystack_reference: string
  user_id: string
  amount: number
  currency: string
  status: string
  created_at: string
  users: {
    email: string
    name: string
    subscription_tier: string
  }
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/payments')
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paystack_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.users.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default'
      case 'failed': return 'destructive'
      case 'pending': return 'secondary'
      case 'refunded': return 'outline'
      default: return 'secondary'
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch(tier) {
      case 'free': return 'bg-gray-500'
      case 'pro': return 'bg-blue-500'
      case 'premium': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const handleStatusUpdate = (payment: Payment) => {
    setSelectedPayment(payment)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by reference, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchPayments} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.paystack_reference}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.users.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{payment.users.email}</p>
                        <Badge className={`${getTierBadgeColor(payment.users.subscription_tier)} text-white text-xs mt-1`}>
                          {payment.users.subscription_tier.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleStatusUpdate(payment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payments found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <PaymentStatusDialog
        payment={selectedPayment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdate={fetchPayments}
      />
    </div>
  )
}