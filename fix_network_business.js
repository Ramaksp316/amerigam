const fs = require('fs');
const path = 'app/network/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace("where: { id: { not: userId }, accountType: 'PERSONAL' },", "where: { id: { not: userId } },");
content = content.replace("personalProfile: true,", "personalProfile: true, businessProfile: true, organizationProfile: true,");

fs.writeFileSync(path, content);
console.log("network business fixed");
