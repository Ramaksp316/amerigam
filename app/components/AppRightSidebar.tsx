import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

export default async function AppRightSidebar({
  userId,
  mode = 'competitions'
}: {
  userId?: string;
  mode?: 'competitions' | 'network' | 'communities';
}) {
  if (!userId) return null;

  const [user, userCommunities, joinedRegistrations, activeFriends] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        personalProfile: true,
        creatorProfile: true
      }
    }),
    prisma.communityMember.findMany({
      where: { userId },
      include: { community: true },
      take: 5,
      orderBy: { joinedAt: 'desc' }
    }),
    mode !== 'network'
      ? prisma.eventRegistration.findMany({
          where: { userId },
          include: { event: true },
          take: 3,
          orderBy: { joinedAt: 'desc' }
        })
      : Promise.resolve([]),
    mode === 'network'
      ? prisma.follow.findMany({
          where: { followerId: userId },
          include: {
            following: {
              select: { id: true, name: true, username: true, avatarData: true, status: true }
            }
          },
          take: 5
        })
      : Promise.resolve([])
  ]);

  if (!user) return null;

  // Determine user title/role
  const userTitle =
    user.personalProfile?.mainIdentity ||
    user.creatorProfile?.creatorType ||
    (user.accountType === 'CREATOR' ? 'Creator' : user.accountType === 'BUSINESS' ? 'Founder' : 'Editor');

  const apPoints = user.amerigamPoints || 1001;
  const userRank = 11;
  const rating = '9.3';

  return (
    <aside style={{
      width: '250px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px 10px 20px 0',
      boxSizing: 'border-box'
    }} className="desktop-only">
      
      {/* ========================================================
          CARD 1: USER PROFILE CARD (Exact match to Figma)
         ======================================================== */}
      <div style={{
        backgroundColor: '#18181B',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Top: Rainbow Avatar + (Title on top, 3 Stats below) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Circular Rainbow Avatar */}
          <Link href={`/user/${user.id}`} style={{ textDecoration: 'none', display: 'flex', flexShrink: 0 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              padding: '2.5px',
              background: 'linear-gradient(135deg, #EC4899, #EF4444, #F59E0B, #10B981, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#18181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.avatarData ? (
                  <img src={user.avatarData} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px' }}>
                    {user.name?.[0] || 'E'}
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* User Role Title + Stats Stack (Never truncated) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
            <Link href={`/user/${user.id}`} style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {userTitle}
              </div>
            </Link>

            {/* Stats Row: 11 Rank | 1001 AP | 9.3 Rating */}
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', whiteSpace: 'nowrap' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{userRank}</span>{' '}
                <span style={{ color: '#71717A' }}>Rank</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{apPoints}</span>{' '}
                <span style={{ color: '#71717A' }}>AP</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{rating}</span>{' '}
                <span style={{ color: '#71717A' }}>Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-section: Your Communities (Exact match to Figma) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>
            Your Communities
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 4 Gray Circles */}
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#D4D4D8',
                  flexShrink: 0
                }}
              />
            ))}
            {/* 1 Emerald / Blue gradient circle matching Figma */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 50%, #2563EB 50%)',
              flexShrink: 0
            }} />
          </div>

          {/* Indicator slider / pill */}
          <div style={{
            width: '50px',
            height: '3px',
            backgroundColor: '#3F3F46',
            borderRadius: '999px',
            margin: '6px auto 0'
          }} />
        </div>
      </div>

      {/* ========================================================
          CARD 2: (A) COMPETITIONS JOINED or (B) ACTIVE FRIENDS
         ======================================================== */}
      {mode === 'network' ? (
        /* Network View: Active Friends */
        <div style={{
          backgroundColor: '#18181B',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>
            Active Friends
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeFriends.length > 0 ? (
              activeFriends.map((f, i) => (
                <Link
                  key={f.following.id || i}
                  href={`/user/${f.following.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#E4E4E7',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {f.following.avatarData ? (
                        <img src={f.following.avatarData} alt="friend" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      border: '1.5px solid #18181B'
                    }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
                    {f.following.name || f.following.username}
                  </span>
                </Link>
              ))
            ) : (
              [0, 1, 2, 3].map((_, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#D4D4D8'
                  }} />
                </div>
              ))
            )}

            {/* Accent colored dots at bottom */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#EAB308' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            </div>
          </div>
        </div>
      ) : (
        /* Competitions & Communities View: Competition you have joined */
        <div style={{
          backgroundColor: '#18181B',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>
            Competition you have joined
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Item 1: Behind You - Running RR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#D4D4D8',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                <img src="/images/competitions/poster_comp_1.png" alt="comp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Behind You - Running RR
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#C5F82A' }}>
                  <span>📅 SEP 8 2026 7:00AM</span>
                  <span style={{ color: '#71717A' }}>📍 SURAT</span>
                </div>
              </div>
            </div>

            {/* Item 2: Tried-Jump */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#D4D4D8',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                <img src="/images/competitions/poster_comp_2.png" alt="comp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Tried-Jump
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#C5F82A' }}>
                  <span>📅 OCT 11 2026 9:00AM</span>
                  <span style={{ color: '#71717A' }}>📍 AHMEDABAD</span>
                </div>
              </div>
            </div>

            {/* Item 3: Skeleton Lines */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#D4D4D8', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ height: '3px', width: '55px', backgroundColor: '#C5F82A', borderRadius: '999px' }} />
                <div style={{ height: '3px', width: '35px', backgroundColor: '#52525B', borderRadius: '999px' }} />
              </div>
            </div>

            {/* Accent colored dots at bottom (Lime, Emerald, Blue) matching Figma */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#C5F82A' }} />
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
