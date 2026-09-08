const fs = require('fs');

function fixFile(filePath) {
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes('ProfilePicture')) {
        content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport ProfilePicture from '../components/ProfilePicture';");
    }
    
    // Replace network page avatars
    if(filePath.includes('network')) {
        content = content.replace(/<div style=\{\{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden', flexShrink: 0 \}\}>\s*\{person.avatarData \? \(\s*<img src=\{person.avatarData\} style=\{\{width:'100%', height:'100%', objectFit:'cover'\}\} \/>\s*\) : \(\s*<div style=\{\{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A'\}\}><Users size=\{24\}\/><\/div>\s*\)\}\s*<\/div>/g, '<ProfilePicture user={person} size={56} showStatus={false} />');
    }
    
    fs.writeFileSync(filePath, content);
}

fixFile('app/network/page.tsx');
console.log('done network');
