// Manual Payment Configuration (Bank Transfer)

export const PAYMENT_DETAILS = {
  bankName: process.env.BANK_NAME || 'Your Bank Name',
  accountName: process.env.ACCOUNT_NAME || 'Your Account Name',
  accountNumber: process.env.ACCOUNT_NUMBER || '1234567890',
  routingNumber: process.env.ROUTING_NUMBER || '', // Optional
  currency: process.env.CURRENCY || 'NGN',
};

export const PLANS = {
  ONE_TIME: {
    name: 'One-Time Deep Audit',
    description: 'Comprehensive 90-checkpoint security, UX & performance audit with tagged code fixes and PDF report.',
    price: 50000, // ₦50,000 NGN (~$199 USD equivalent)
    mode: 'one_time' as const,
  },
  SUBSCRIPTION: {
    name: 'Continuous Security & UX Monitoring',
    description: 'Weekly automated 90-checkpoint re-scans, instant vulnerability alerts, and priority remediation support.',
    price: 25000, // ₦25,000 NGN per month (~$99 USD equivalent)
    mode: 'subscription' as const,
  },
};

export type PaymentStatus = 'pending_payment' | 'payment_submitted' | 'payment_confirmed' | 'audit_in_progress' | 'completed';
