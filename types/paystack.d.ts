declare module '@paystack/inline-js' {
  interface PaystackTransaction {
    reference: string
    trans: string
    status: string
    message: string
    transaction: string
    trxref: string
  }

  interface PaystackConfig {
    key: string
    email: string
    amount: number
    ref: string
    metadata?: Record<string, any>
    onSuccess: (transaction: PaystackTransaction) => void
    onCancel: () => void
    onError: (error: any) => void
  }

  export default class Paystack {
    newTransaction(config: PaystackConfig): void
  }
}