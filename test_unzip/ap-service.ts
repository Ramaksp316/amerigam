import { prisma } from './prisma';
import { getCompetitionAP, getChallengeAP } from './ap-matrix';

/**
 * Calculates and awards Competition AP based on the user's highest valid result.
 * Idempotent: Can be called multiple times safely (will revoke/re-award if results changed).
 */
export async function awardCompetitionAP(eventId: string) {
  // 1. Fetch the event and published results/registrations
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: true,
      results: {
        where: { status: 'PUBLISHED' }
      }
    }
  });

  if (!event) throw new Error(`Event ${eventId} not found`);
  
  // Can only award if the competition's results are officially published
  if (event.resultStatus !== 'PUBLISHED') {
    throw new Error(`Cannot award AP: Event ${eventId} results are not published.`);
  }

  if (!event.eventLevel) {
    throw new Error(`Cannot award AP: Event ${eventId} is missing a competition level.`);
  }

  // 2. Map users to their highest valid result
  const userHighestResult = new Map<string, 'PARTICIPATION' | 'QUALIFIED' | 'BRONZE' | 'SILVER' | 'GOLD'>();

  for (const reg of event.registrations) {
    // Determine the base state for the registration
    // We only consider genuine participants (e.g. APPROVED or QUALIFIED).
    // If they were REJECTED, CANCELLED, or PENDING, they don't get participation AP.
    if (reg.status !== 'APPROVED') continue;

    let resultTier: 'PARTICIPATION' | 'QUALIFIED' | 'BRONZE' | 'SILVER' | 'GOLD' = 'PARTICIPATION';
    
    if (reg.qualificationStatus === 'QUALIFIED') {
      resultTier = 'QUALIFIED';
    }

    // Check if they have an official top-tier placement in the results
    const placement = event.results.find(r => r.registrationId === reg.id);
    if (placement) {
      if (placement.type === 'WINNER') resultTier = 'GOLD';
      else if (placement.type === 'RUNNER_UP') resultTier = 'SILVER';
      else if (placement.type === 'THIRD') resultTier = 'BRONZE';
      // TOP_10 falls back to QUALIFIED or PARTICIPATION depending on what they already had, 
      // as requested: "#4-#10 should not automatically receive Bronze/Silver/Gold... use Participation or Qualified"
    }

    userHighestResult.set(reg.userId, resultTier);
  }

  // 3. Perform database transactions for each valid participant
  await prisma.$transaction(async (tx) => {
    // Fetch all existing transactions for this event to handle duplicate protection / revocation
    const existingTx = await tx.apTransaction.findMany({
      where: {
        sourceType: 'COMPETITION',
        sourceId: eventId
      }
    });

    for (const [userId, resultTier] of userHighestResult.entries()) {
      const apAmount = getCompetitionAP(event.eventLevel, resultTier);

      const existingUserTx = existingTx.find(t => t.userId === userId);

      if (existingUserTx) {
        // If the transaction already exists, check if it needs to be updated
        if (existingUserTx.amount !== apAmount || existingUserTx.status !== 'AWARDED') {
          // Adjust user's total AP by reversing the old amount and adding the new
          const diff = apAmount - (existingUserTx.status === 'AWARDED' ? existingUserTx.amount : 0);
          
          await tx.apTransaction.update({
            where: { id: existingUserTx.id },
            data: {
              amount: apAmount,
              status: 'AWARDED',
              resultType: resultTier,
              competitionLevel: event.eventLevel
            }
          });

          if (diff !== 0) {
            await tx.user.update({
              where: { id: userId },
              data: { amerigamPoints: { increment: diff } }
            });
          }
        }
      } else {
        // Create new transaction
        await tx.apTransaction.create({
          data: {
            userId,
            sourceType: 'COMPETITION',
            sourceId: eventId,
            sourceName: event.name,
            competitionLevel: event.eventLevel,
            resultType: resultTier,
            amount: apAmount,
            status: 'AWARDED',
          }
        });

        // Add to user total
        await tx.user.update({
          where: { id: userId },
          data: { amerigamPoints: { increment: apAmount } }
        });
      }
    }

    // Handle revocations: If an existing transaction is no longer in the userHighestResult map (e.g. registration deleted/rejected later)
    for (const oldTx of existingTx) {
      if (!userHighestResult.has(oldTx.userId) && oldTx.status === 'AWARDED') {
        // Revoke it
        await tx.apTransaction.update({
          where: { id: oldTx.id },
          data: { status: 'REVOKED' }
        });

        await tx.user.update({
          where: { id: oldTx.userId },
          data: { amerigamPoints: { decrement: oldTx.amount } }
        });
      }
    }
  });

  return { success: true };
}

/**
 * Explicitly revokes all AP awarded for a competition (e.g., if it was found to be fraudulent)
 */
export async function revokeCompetitionAP(eventId: string) {
  await prisma.$transaction(async (tx) => {
    const transactions = await tx.apTransaction.findMany({
      where: {
        sourceType: 'COMPETITION',
        sourceId: eventId,
        status: 'AWARDED'
      }
    });

    for (const apTx of transactions) {
      await tx.apTransaction.update({
        where: { id: apTx.id },
        data: { status: 'REVOKED' }
      });

      await tx.user.update({
        where: { id: apTx.userId },
        data: { amerigamPoints: { decrement: apTx.amount } }
      });
    }
  });
}

/**
 * Calculates and awards AP for a Challenge
 */
export async function awardChallengeAP(userId: string, challengeId: string, challengeName: string, difficulty: string) {
  const apAmount = getChallengeAP(difficulty);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.apTransaction.findUnique({
      where: {
        userId_sourceId_sourceType: {
          userId,
          sourceId: challengeId,
          sourceType: 'CHALLENGE'
        }
      }
    });

    if (existing) {
      if (existing.status !== 'AWARDED') {
        // Re-award if it was revoked
        await tx.apTransaction.update({
          where: { id: existing.id },
          data: { status: 'AWARDED', amount: apAmount }
        });
        await tx.user.update({
          where: { id: userId },
          data: { amerigamPoints: { increment: apAmount } }
        });
      }
      return; // Idempotent: already awarded
    }

    await tx.apTransaction.create({
      data: {
        userId,
        sourceType: 'CHALLENGE',
        sourceId: challengeId,
        sourceName: challengeName,
        challengeDifficulty: difficulty,
        amount: apAmount,
        status: 'AWARDED'
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: { amerigamPoints: { increment: apAmount } }
    });
  });
}
