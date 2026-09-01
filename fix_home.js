const fs = require('fs');

let homeContent = fs.readFileSync('app/home/page.tsx', 'utf-8');
homeContent = homeContent.replace(/color="#1D9BF0" fill="#1D9BF0"/g, 'color="var(--accent-primary)" fill="var(--accent-primary)"');
fs.writeFileSync('app/home/page.tsx', homeContent);

let networkContent = fs.readFileSync('app/network/page.tsx', 'utf-8');
networkContent = networkContent.replace(/color="#1D9BF0" fill="#1D9BF0"/g, 'color="var(--accent-primary)" fill="var(--accent-primary)"');
fs.writeFileSync('app/network/page.tsx', networkContent);
