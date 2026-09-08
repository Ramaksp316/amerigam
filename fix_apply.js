const fs = require('fs');
const path = 'app/competitions/[id]/apply/ApplyClient.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace("minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>", "minHeight: '100vh', paddingBottom: '100px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>");

fs.writeFileSync(path, content);
console.log("apply padding fixed");
