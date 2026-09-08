const fs = require('fs');
let content = fs.readFileSync('app/messages/[id]/page.tsx', 'utf-8');

if (!content.includes('ProfilePicture')) {
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport ProfilePicture from '../../components/ProfilePicture';");
}

const oldAvatar = `<div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#27272A', flexShrink: 0 }}>
            {partner.avatarData ? (
              <img src={partner.avatarData} alt={partner.name || partner.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>`;
const newAvatar = `<ProfilePicture user={partner} size={40} showStatus={false} />`;

content = content.replace(oldAvatar, newAvatar);

fs.writeFileSync('app/messages/[id]/page.tsx', content);
console.log('done messages header');
