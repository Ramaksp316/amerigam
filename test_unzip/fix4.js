const fs = require('fs');
let content = fs.readFileSync('app/communities/[id]/page.tsx', 'utf-8');

if (!content.includes('ProfilePicture')) {
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport ProfilePicture from '../../components/ProfilePicture';");
}
if (!content.includes('CommunityAvatar')) {
    content = content.replace("import ProfilePicture from '../../components/ProfilePicture';", "import ProfilePicture from '../../components/ProfilePicture';\nimport CommunityAvatar from '../../components/CommunityAvatar';");
}

const oldPostAvatar = `<div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
                         {author.avatarData ? <img src={author.avatarData} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A'}}><Users size={20}/></div>}
                      </div>`;
const newPostAvatar = `<ProfilePicture user={author} size={40} showStatus={false} />`;
content = content.replace(oldPostAvatar, newPostAvatar);

const oldMemberAvatar = `<div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
                        {member.user.avatarData ? (
                          <img src={member.user.avatarData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A' }}><Users size={24} /></div>
                        )}
                      </div>`;
const newMemberAvatar = `<ProfilePicture user={member.user} size={48} showStatus={false} />`;
content = content.replace(oldMemberAvatar, newMemberAvatar);

fs.writeFileSync('app/communities/[id]/page.tsx', content);
console.log('done community page');
