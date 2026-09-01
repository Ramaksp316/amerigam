import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const paymentId = resolvedParams.paymentId;
    
    const { status } = await req.json();

    const payment = await prisma.eventPayment.findUnique({
      where: { id: paymentId },
      include: { registration: true }
    });

    if (!payment || payment.registration.userId !== userId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    // Update Payment
    await prisma.eventPayment.update({
      where: { id: paymentId },
      data: {
        status: status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        transactionId: status === 'SUCCESS' ? `TEST-TXN-${Date.now()}` : null
      }
    });

    // Update Registration
    if (status === 'SUCCESS') {
      await prisma.eventRegistration.update({
        where: { id: payment.registrationId },
        data: { status: 'APPROVED' } // Approved means registered for Phase 2
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
