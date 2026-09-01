const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Add fields to Event
if (!s.includes('entryFee')) {
  s = s.replace(/coverImage String\?/, 'coverImage String?\n    prizePool  String?\n    entryFee   Float?    @default(0)\n    currency   String?   @default("INR")');
}
if (!s.includes('resultStatus')) {
  s = s.replace(/createdAt DateTime @default\(now\(\)\)/, 'createdAt DateTime @default(now())\n  resultStatus String @default("NOT_STARTED")\n  results EventResult[]');
}

// 2. Add qualificationStatus, rejectionReason to EventRegistration
if (!s.includes('qualificationStatus')) {
  s = s.replace(/status          String  @default\("PENDING"\) \/\/ PENDING, APPROVED, REJECTED, CANCELLED/, 'status          String  @default("PENDING") // PENDING, APPROVED, REJECTED, CANCELLED\n  qualificationStatus String? // QUALIFIED, NON_QUALIFIED\n  rejectionReason String?');
}

// 3. Add payment to EventRegistration
if (!s.includes('payment      EventPayment?')) {
  s = s.replace(/team         EventTeam\?         @relation\(fields: \[teamId\], references: \[id\]\)/, 'team         EventTeam?         @relation(fields: [teamId], references: [id])\n  payment      EventPayment?');
}
if (!s.includes('results      EventResult[]')) {
  s = s.replace(/certificates EventCertificate\[\]/, 'certificates EventCertificate[]\n  results      EventResult[]');
}

// 4. Add EventPayment model
if (!s.includes('model EventPayment')) {
  s += `
model EventPayment {
  id             String            @id @default(uuid())
  registrationId String            @unique
  registration   EventRegistration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  amount         Float
  currency       String            @default("INR")
  status         String            @default("PENDING") // PENDING, SUCCESS, FAILED
  provider       String?           
  transactionId  String?           @unique
  createdAt      DateTime          @default(now())
}
`;
}

// 5. Add EventResult model
if (!s.includes('model EventResult')) {
  s += `
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
}

// 6. Add results to User
if (!s.includes('eventResults EventResult[]')) {
  s = s.replace(/createdEvents      Event\[\]/, 'createdEvents      Event[]\n  eventResults EventResult[]');
}

fs.writeFileSync('prisma/schema.prisma', s);
