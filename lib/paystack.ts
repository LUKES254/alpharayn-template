import Paystack from '@paystack/inline-js'

const paystack = new Paystack()

export const initializePaystackPayment = async ({
  email,
  amount,
  reference,
  metadata = {},
}: {
  email: string
  amount: number // in kobo
  reference: string
  metadata?: Record<string, any>
}) => {
  return new Promise((resolve, reject) => {
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email,
      amount,
      ref: reference,
      metadata,
      onSuccess: (transaction) => {
        resolve(transaction)
      },
      onCancel: () => {
        reject(new Error('Payment cancelled'))
      },
      onError: (error) => {
        reject(error)
      }
    })
  })
}