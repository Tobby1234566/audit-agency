import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const url = formData.get('url') as string;
    const plan = formData.get('plan') as string;
    const receipt = formData.get('receipt') as File | null;

    if (!email || !url || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt file is required' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Save receipt file
    const bytes = await receipt.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${receipt.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // TODO: Save order to database (Vercel Postgres)
    // For now, we'll just log it
    console.log('Payment submission:', {
      email,
      url,
      plan,
      receiptPath: `/uploads/receipts/${filename}`,
      timestamp: new Date().toISOString(),
    });

    // In production, you'd:
    // 1. Insert into 'audits' table with status 'payment_submitted'
    // 2. Send confirmation email to user
    // 3. Send notification to admin to verify payment

    return NextResponse.json({
      success: true,
      message: 'Payment receipt uploaded successfully. We will verify and start your audit within 24 hours.',
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process checkout' }, { status: 500 });
  }
}
