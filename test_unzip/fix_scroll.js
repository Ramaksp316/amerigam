const fs = require('fs');
const path = 'app/user/[id]/UserProfileClient.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace("href={`/user/${targetUserId}?tab=${t}`}", "href={`/user/${targetUserId}?tab=${t}`} scroll={false}");

fs.writeFileSync(path, content);
console.log("scroll fixed");
