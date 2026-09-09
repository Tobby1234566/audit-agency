'use client';

import { useState } from 'react';
import { PLANS, PAYMENT_DETAILS } from '@/lib/payment';

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<'ONE_TIME' | 'SUBSCRIPTION'>('ONE_TIME');
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const plan = PLANS[selectedPlan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('url', url);
    formData.append('plan', selectedPlan);
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Received!</h2>
          <p className="text-slate-600 mb-6">
            We'll verify your payment and start your audit within 24 hours. You'll receive an email at <strong>{email}</strong> once it's ready.
          </p>
          <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </a>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Order</h1>
          <p className="text-slate-600 mb-8">Choose your plan and submit payment details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">Select Plan</label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('ONE_TIME')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedPlan === 'ONE_TIME'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900 mb-1">${PLANS.ONE_TIME.price} One-Time</div>
                  <div className="text-sm text-slate-600">{PLANS.ONE_TIME.name}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('SUBSCRIPTION')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedPlan === 'SUBSCRIPTION'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900 mb-1">${PLANS.SUBSCRIPTION.price}/month</div>
                  <div className="text-sm text-slate-600">{PLANS.SUBSCRIPTION.name}</div>
                </button>
              </div>
            </div>

            {/* Your Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Website URL to Audit</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-900 text-lg mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount to Pay:</span>
                  <span className="font-bold text-slate-900 text-xl">${plan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bank Name:</span>
                  <span className="font-semibold text-slate-900">{PAYMENT_DETAILS.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Account Name:</span>
                  <span className="font-semibold text-slate-900">{PAYMENT_DETAILS.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Account Number:</span>
                  <span className="font-bold text-slate-900 text-lg tracking-wide">{PAYMENT_DETAILS.accountNumber}</span>
                </div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Upload Payment Receipt (Screenshot or PDF)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {receiptFile ? (
                    <p className="text-sm font-medium text-green-600">{receiptFile.name}</p>
                  ) : (
                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, or PDF (max 5MB)</p>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Submitting...' : `Submit Payment & Request Audit`}
            </button>

            <p className="text-xs text-slate-500 text-center">
              After payment verification (usually within 24 hours), we'll start your audit and email the results to {email || 'your email'}.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
