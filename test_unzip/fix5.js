const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('model ApTransaction')) {
  const apTransactionModel = `
model ApTransaction {
  id                 String   @id @default(uuid())
  userId             String
  user               User     @relation("userApTransactions", fields: [userId], references: [id])
  sourceType         String   // "COMPETITION", "CHALLENGE"
  sourceId           String   // eventId, challengeId
  sourceName         String?
  competitionLevel   String?  // City, State, National, International
  resultType         String?  // Participation, Qualified, Bronze, Silver, Gold
  challengeDifficulty String? // Easy, Medium, Hard, Major
  amount             Int
  status             String   @default("AWARDED") // AWARDED, REVOKED
  metadata           String?  // JSON string for additional context
  awardedAt          DateTime @default(now())

  @@unique([userId, sourceId, sourceType])
}
`;
  schema += apTransactionModel;

  // Add relation to User model
  if (!schema.includes('apTransactions   ApTransaction[]')) {
    schema = schema.replace(
      'assignedTasks CommunityTask[] @relation("assignedTasks")',
      'assignedTasks CommunityTask[] @relation("assignedTasks")\n  apTransactions   ApTransaction[] @relation("userApTransactions")'
    );
  }

  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log("ApTransaction model added successfully.");
} else {
  console.log("ApTransaction already exists.");
}
