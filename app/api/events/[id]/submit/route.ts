import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;
    const body = await req.json();
    const { projectTitle, contentUrl, description } = body;

    if (!projectTitle || !contentUrl) {
      return NextResponse.json({ error: 'Project Title and Content URL are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || !event.requireSubmissions) {
      return NextResponse.json({ error: 'This event does not accept submissions' }, { status: 400 });
    }

    // Find the user's registration for this event
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      },
      include: {
        submissions: true
      }
    });

    if (!registration) {
      return NextResponse.json({ error: 'You must register for this event before submitting' }, { status: 403 });
    }

    if (registration.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your registration is pending approval' }, { status: 403 });
    }

    // If user already submitted, update the existing submission, else create new
    let submission;
    if (registration.submissions && registration.submissions.length > 0) {
      submission = await prisma.eventSubmission.update({
        where: { id: registration.submissions[0].id },
        data: {
          projectTitle,
          contentUrl,
          description
        }
      });
    } else {
      submission = await prisma.eventSubmission.create({
        data: {
          registrationId: registration.id,
          projectTitle,
          contentUrl,
          description
        }
      });
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error submitting project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
