const fs = require('fs');
const path = 'app/components/MobileBottomNav.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
    "if (isIndividualChat || isCommunityPage) return null;", 
    "if (isIndividualChat || isCommunityPage || pathname?.includes('/apply')) return null;"
);

fs.writeFileSync(path, content);
console.log("nav hidden on apply");
