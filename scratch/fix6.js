const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('country        String?')) {
  schema = schema.replace(
    'location       String?',
    'location       String?\n  country        String? // For ranking\n  state          String? // For ranking\n  city           String? // For ranking\n  district       String? // For ranking'
  );
  
  // Also index the amerigamPoints and location fields for fast ranking
  if (!schema.includes('@@index([accountType, amerigamPoints(sort: Desc)])')) {
    schema = schema.replace(
      'model User {',
      `model User {\n  @@index([accountType, amerigamPoints(sort: Desc)])\n  @@index([country, state, city, district])`
    );
  }

  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log("Structured geography and indexes added to User model.");
} else {
  console.log("Structured geography already exists.");
}
