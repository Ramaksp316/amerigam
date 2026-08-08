import { prisma } from '../../../../lib/prisma';
import { notFound } from 'next/navigation';
import BuilderClient from './BuilderClient';

export default async function CompetitionModelBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const model = await prisma.competitionModel.findUnique({
    where: { id },
    include: {
      nodes: true,
      connections: true
    }
  });

  if (!model) {
    notFound();
  }

  // Pass plain objects to client component to avoid class serialization issues
  const plainModel = {
    id: model.id,
    name: model.name,
    description: model.description,
    isPublished: model.isPublished,
    nodes: model.nodes.map(n => ({
      id: n.id,
      type: n.type,
      name: n.name,
      config: JSON.parse(n.config),
      positionX: n.positionX,
      positionY: n.positionY
    })),
    connections: model.connections.map(c => ({
      id: c.id,
      sourceId: c.sourceId,
      targetId: c.targetId,
      condition: c.condition
    }))
  };

  return (
    <div style={{ height: '100vh', width: '100vw', background: 'var(--background)' }}>
      <BuilderClient initialModel={plainModel} />
    </div>
  );
}
