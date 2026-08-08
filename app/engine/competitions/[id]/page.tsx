import { prisma } from '../../../../lib/prisma';
import { notFound } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function CompetitionDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      model: {
        include: {
          nodes: true,
          connections: true
        }
      },
      stages: {
        include: {
          node: true,
          matchups: {
            include: {
              participants: {
                include: {
                  entity: {
                    include: { user: true, team: true }
                  }
                }
              }
            }
          }
        }
      },
      entities: {
        include: {
          user: true,
          team: true
        }
      }
    }
  });

  if (!competition) {
    notFound();
  }

  return (
    <div style={{ padding: 'var(--space-6)', background: 'var(--background)', minHeight: '100vh' }}>
      <DashboardClient competition={competition} />
    </div>
  );
}
