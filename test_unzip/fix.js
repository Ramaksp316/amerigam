const fs = require('fs');
let content = fs.readFileSync('app/user/[id]/UserProfileClient.tsx', 'utf-8');

const oldIncoming = `<div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {conn.source.avatarData ? (
                              <img src={conn.source.avatarData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ color: 'white', fontSize: '16px' }}>{conn.source.name?.charAt(0) || 'U'}</span>
                            )}
                          </div>`;
const newIncoming = `<ProfilePicture user={conn.source} size={40} showStatus={false} />`;
content = content.replace(oldIncoming, newIncoming);

const oldOutgoing = `<div style={{
                          padding: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '10px',
                          border: '1px solid #1A1A1A'
                        }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>`;
const newOutgoing = `<div style={{
                          padding: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '10px',
                          border: '1px solid #1A1A1A',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <ProfilePicture user={conn.target} size={40} showStatus={false} />
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>`;
content = content.replace(oldOutgoing, newOutgoing);

const oldOutgoingEnd = `{conn.status === 'PAST' ? ' · Past' : ' · Current'}
                          </p>
                        </div>`;
const newOutgoingEnd = `{conn.status === 'PAST' ? ' · Past' : ' · Current'}
                          </p>
                          </div>
                        </div>`;
content = content.replace(oldOutgoingEnd, newOutgoingEnd);

fs.writeFileSync('app/user/[id]/UserProfileClient.tsx', content);
console.log('done');
