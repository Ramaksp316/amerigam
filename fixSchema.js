const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');

s = s.replace(/model Event \{[\s\S]*?createdAt DateTime @default\(now\(\)\)/, (m) => m + '\n  resultStatus String @default("NOT_STARTED")\n  results EventResult[]');

const newModel = `
model EventResult {
  id String @id @default(uuid())
  eventId String
  registrationId String
  userId String
  rank Int
  type String // WINNER, RUNNER_UP, THIRD, TOP_10
  status String @default("DRAFT") // DRAFT, PUBLISHED
  publishedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  event Event @relation(fields: [eventId], references: [id])
  registration EventRegistration @relation(fields: [registrationId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
`;
s += newModel;
fs.writeFileSync('prisma/schema.prisma', s);
