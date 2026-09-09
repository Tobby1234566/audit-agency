// Manual Payment Configuration (Bank Transfer)

export const PAYMENT_DETAILS = {
  bankName: process.env.BANK_NAME || 'Your Bank Name',
  accountName: process.env.ACCOUNT_NAME || 'Your Account Name',
  accountNumber: process.env.ACCOUNT_NUMBER || '1234567890',
  routingNumber: process.env.ROUTING_NUMBER || '', // Optional
  currency: 'USD',
};

export const PLANS = {
  ONE_TIME: {
    name: 'One-Time Deep Audit',
    description: 'Comprehensive 90-checkpoint security, UX & performance audit with tagged code fixes and PDF report.',
    price: 199, // $199.00 USD
    mode: 'one_time' as const,
  },
  SUBSCRIPTION: {
    name: 'Continuous Security & UX Monitoring',
    description: 'Weekly automated 90-checkpoint re-scans, instant vulnerability alerts, and priority remediation support.',
    price: 99, // $99.00 USD per month
    mode: 'subscription' as const,
  },
};

export type PaymentStatus = 'pending_payment' | 'payment_submitted' | 'payment_confirmed' | 'audit_in_progress' | 'completed';
