import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await prisma.eventPayment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: {
            event: true,
            user: true,
          }
        }
      }
    });

    if (!payment || payment.registration.userId !== userId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const amountInPaise = Math.round(payment.amount * 100);

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${payment.id.substring(0, 10)}`,
        notes: {
          paymentId: payment.id,
          registrationId: payment.registrationId,
          eventId: payment.registration.eventId,
          userEmail: payment.registration.user?.email || '',
        }
      }),
    });

    const orderData = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('Razorpay Order Creation Failed:', orderData);
      return NextResponse.json({ error: orderData.error?.description || 'Failed to create Razorpay order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: keyId,
      eventName: payment.registration.event.name,
      userName: payment.registration.user?.name || '',
      userEmail: payment.registration.user?.email || '',
      userPhone: payment.registration.user?.phoneNumber || '',
    });
  } catch (error: any) {
    console.error('Razorpay create-order route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
