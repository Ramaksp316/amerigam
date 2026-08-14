import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database reset...');

  // Deleting records in reverse order of relationships to avoid foreign key errors
  await prisma.$transaction([
    // Universal Competition Engine dependencies
    prisma.matchupParticipant.deleteMany(),
    prisma.matchup.deleteMany(),
    prisma.stage.deleteMany(),
    prisma.competitionEntity.deleteMany(),
    prisma.competition.deleteMany(),
    prisma.modelConnection.deleteMany(),
    prisma.modelNode.deleteMany(),
    prisma.competitionModel.deleteMany(),

    // Competitions & Portfolios dependencies
    prisma.eventCertificate.deleteMany(),
    prisma.eventEvaluation.deleteMany(),
    prisma.eventSubmission.deleteMany(),
    prisma.eventCheckIn.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.eventTeam.deleteMany(),
    prisma.event.deleteMany(),

    // Communities dependencies
    prisma.communityTask.deleteMany(),
    prisma.communityPost.deleteMany(),
    prisma.communityMember.deleteMany(),
    prisma.communityNote.deleteMany(),
    prisma.community.deleteMany(),

    // Core interactions
    prisma.message.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.achievement.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.pushSubscription.deleteMany(),

    // Users (base model)
    prisma.user.deleteMany()
  ]);

  console.log('Successfully wiped all test data. Database is now clean.');
}

main()
  .catch((e) => {
    console.error('Error during database reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
