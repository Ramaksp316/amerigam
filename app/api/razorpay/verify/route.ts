import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment verification details' }, { status: 400 });
    }

    const payment = await prisma.eventPayment.findUnique({
      where: { id: paymentId },
      include: { registration: true }
    });

    if (!payment || payment.registration.userId !== userId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
    }

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Razorpay Signature Mismatch:', { generated: generatedSignature, received: razorpay_signature });
      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // Mark payment as SUCCESS and registration as APPROVED
    await prisma.$transaction([
      prisma.eventPayment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          transactionId: razorpay_payment_id,
          provider: 'RAZORPAY',
        }
      }),
      prisma.eventRegistration.update({
        where: { id: payment.registrationId },
        data: {
          status: 'APPROVED',
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully and registration approved!',
      eventId: payment.registration.eventId,
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
