const fs = require('fs');
const path = 'app/create/actions.ts';
let content = fs.readFileSync(path, 'utf-8');

// For story
content = content.replace(/redirect\('\/feed'\);\s*\} else \{/g, "redirect(`/user/${userId}`);\n    } else {");

// For post/reel
content = content.replace(/redirect\('\/feed'\);\s*\}\s*\}\s*\}/g, "redirect(`/user/${userId}?tab=posts`);\n    }\n  }\n}");

fs.writeFileSync(path, content);
console.log("redirect fixed");
