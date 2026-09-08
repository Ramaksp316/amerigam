const fs = require('fs');
let content = fs.readFileSync('app/components/ReelFeedClient.tsx', 'utf-8');

// Remove logo image
content = content.replace(/<div style={{ width: 34, height: 34, borderRadius: '8px', overflow: 'hidden' }}>[\s\S]*?<\/div>/, '');

// Change Reels text to Feed
content = content.replace(/>Reels<\/span>/, '>Feed</span>');

// Fix checkmark color
content = content.replace(/color="#1D9BF0" fill="#1D9BF0"/g, 'color="var(--accent-primary)" fill="var(--accent-primary)"');

fs.writeFileSync('app/components/ReelFeedClient.tsx', content);
