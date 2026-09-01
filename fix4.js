const fs = require('fs');
let s = fs.readFileSync('prisma/schema.prisma', 'utf8');
const index = s.lastIndexOf('prizePool  String?');
if (index > -1) {
  s = s.substring(0, index) + s.substring(index + 'prizePool  String?'.length);
}
fs.writeFileSync('prisma/schema.prisma', s);
