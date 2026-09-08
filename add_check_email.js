const fs = require('fs');
const path = 'app/signup/actions.ts';
let content = fs.readFileSync(path, 'utf-8');

content = content + `\n\nexport async function checkEmailExists(email: string) {\n  const user = await prisma.user.findFirst({ where: { email } });\n  return !!user;\n}\n`;

fs.writeFileSync(path, content);
console.log("action added");
