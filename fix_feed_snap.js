const fs = require('fs');
let code = fs.readFileSync('app/components/ReelFeedClient.tsx', 'utf-8');
code = code.replace(/scrollSnapAlign:\s*'start',/g, "scrollSnapAlign: 'start',\n        scrollSnapStop: 'always',");
fs.writeFileSync('app/components/ReelFeedClient.tsx', code);
console.log("Updated ReelFeedClient.tsx");
