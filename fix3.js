const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');
s = s.replace(/prizePool\s+String\?\s+prizePool\s+String\?/g, 'prizePool  String?');
fs.writeFileSync('prisma/schema.prisma', s);
