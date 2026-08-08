'use server';

import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function advanceStage(competitionId: string, stageId: string) {
  try {
    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        node: {
          include: {
            sourceConnections: true
          }
        },
        competition: {
          include: {
            entities: { where: { status: 'ACTIVE' } }
          }
        },
        matchups: {
          include: { participants: true }
        }
      }
    });

    if (!stage) throw new Error('Stage not found');

    const connections = stage.node.sourceConnections;
    if (connections.length === 0) {
      // It's the final stage, maybe mark competition as COMPLETED
      await prisma.competition.update({
        where: { id: competitionId },
        data: { state: 'COMPLETED' }
      });
      await prisma.stage.update({
        where: { id: stageId },
        data: { state: 'COMPLETED' }
      });
      revalidatePath(`/engine/competitions/${competitionId}`);
      return { success: true, message: 'Competition Completed!' };
    }

    // Determine who advances based on the current stage type
    let advancingEntities: string[] = [];

    if (stage.node.type === 'START' || stage.node.type === 'REGISTRATION') {
      // Everyone active advances
      advancingEntities = stage.competition.entities.map(e => e.id);
    } else {
      // For MATCH or GROUP stages, we should look at matchup results.
      // Since we haven't built a UI to score them, we'll just randomly pick winners or advance everyone for now.
      // Ideally: advancingEntities = stage.matchups.flatMap(m => m.participants.filter(p => p.result === 'WINNER').map(p => p.entityId));
      advancingEntities = stage.competition.entities.map(e => e.id); // Defaulting to all for Beta
    }

    // Now, push them to the target stages based on connections
    // For Beta, we just assume 1 default connection
    const targetConn = connections[0];
    const targetStage = await prisma.stage.findFirst({
      where: { competitionId, nodeId: targetConn.targetId }
    });

    if (!targetStage) throw new Error('Target stage not found');

    // Create Matchups in target stage
    // If target is MATCH (Knockout), create 1v1 matchups
    const targetNode = await prisma.modelNode.findUnique({ where: { id: targetConn.targetId } });
    
    if (targetNode?.type === 'MATCH' || targetNode?.type === 'STAGE') {
      // Create 1v1 pairings
      const shuffled = advancingEntities.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < shuffled.length; i += 2) {
        const e1 = shuffled[i];
        const e2 = shuffled[i + 1];

        const matchup = await prisma.matchup.create({
          data: {
            matchupId: `AMG-M-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            stageId: targetStage.id,
            state: 'SCHEDULED'
          }
        });

        await prisma.matchupParticipant.create({
          data: { matchupId: matchup.id, entityId: e1 }
        });

        if (e2) {
          await prisma.matchupParticipant.create({
            data: { matchupId: matchup.id, entityId: e2 }
          });
        }
      }
    } else {
      // Group them all into one big evaluation matchup
      const matchup = await prisma.matchup.create({
        data: {
          matchupId: `AMG-M-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          stageId: targetStage.id,
          state: 'SCHEDULED'
        }
      });
      
      for (const eId of advancingEntities) {
        await prisma.matchupParticipant.create({
          data: { matchupId: matchup.id, entityId: eId }
        });
      }
    }

    // Update states
    await prisma.stage.update({
      where: { id: stageId },
      data: { state: 'COMPLETED' }
    });

    await prisma.stage.update({
      where: { id: targetStage.id },
      data: { state: 'ACTIVE' }
    });

    if (stage.competition.state === 'REGISTRATION_OPEN') {
      await prisma.competition.update({
        where: { id: competitionId },
        data: { state: 'ACTIVE' }
      });
    }

    revalidatePath(`/engine/competitions/${competitionId}`);
    return { success: true, message: 'Advanced to next stage!' };

  } catch (err: any) {
    console.error('Error advancing stage:', err);
    return { success: false, error: err.message };
  }
}
