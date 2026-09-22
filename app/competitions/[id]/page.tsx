import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  Headphones,
  LayoutGrid,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import AppRightSidebar from '../../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

export default async function CompetitionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarData: true,
          amerigamPoints: true,
          _count: { select: { followers: true, following: true } }
        }
      },
      _count: {
        select: { registrations: true }
      }
    }
  });

  if (!event) return notFound();

  // Check if current user is registered
  const userRegistration = await prisma.eventRegistration.findUnique({
    where: {
      userId_eventId: { userId, eventId }
    }
  });

  // Date and Time formatting
  const startDate = new Date(event.startDate);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(' ', '');

  // Address
  const fullAddress =
    event.venue ||
    (event.city ? `${event.city}, ${event.state || 'Gujarat'}` : 'SURAT - Opp VR Mall, Dumas Rd, Magdalla, Surat, Gujarat 395007');

  // Tags
  const eventTags = event.tags
    ? event.tags.split(',').map((t) => t.trim())
    : [event.category || 'Running', 'New Friends', 'Your Potential', 'Sports'];

  // Organizer details
  const organizerName = event.creator?.name || event.creator?.username || 'jubelmorac';
  const organizerHandle = `@${event.creator?.username || 'jubelmorac'}`;
  const organizerAvatar = event.creator?.avatarData;
  const organizerFollowers = event.creator?._count?.followers ? `${event.creator._count.followers}` : '101K';
  const organizerAP = event.creator?.amerigamPoints || 5003;
  const organizerNetwork = event.creator?._count?.following ? `${event.creator._count.following}` : '13K';

  // Ticket Pricing
  const priceDisplay = event.entryFee && event.entryFee > 0 ? `$${event.entryFee.toFixed(2)}/150AP` : '$60.00/150AP';
  const winnerPrize = event.prizePool || '$500';

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      display: 'flex',
      justifyContent: 'flex-start',
      overflowX: 'hidden'
    }}>
      {/* 3-COLUMN WRAPPER (Fluid layout, zero horizontal overflow) */}
      <div style={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        minHeight: '100vh',
        overflowX: 'hidden'
      }}>
        {/* Center Main Content Area */}
        <div style={{
          flex: 1,
          minWidth: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 28px 100px 28px',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>

          {/* ========================================================
              EVENT TITLE (e.g. WAR-E-Man)
             ======================================================== */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '20px',
            letterSpacing: '-0.5px'
          }}>
            {event.name}
          </h1>

          {/* ========================================================
              TOP SECTION: POSTER + EVENT QUICK DETAILS + ORGANIZER
             ======================================================== */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 240px) 1fr minmax(200px, 240px)',
            gap: '20px',
            alignItems: 'start',
            marginBottom: '36px'
          }}>
            {/* 1. Event Cover Poster */}
            <div style={{
              width: '240px',
              height: '350px',
              borderRadius: '20px',
              backgroundColor: '#1E1E22',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0
            }}>
              <img
                src={event.coverImage || '/images/competitions/poster_comp_3.png'}
                alt={event.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Amerigam Watermark icon */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                opacity: 0.85,
                zIndex: 2,
                pointerEvents: 'none'
              }}>
                <img
                  src="/amerigam-logo-transparent.png"
                  alt="logo"
                  style={{ width: '22px', height: '12px', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* 2. Quick Details: Location, Pills, Prize, Book Tickets */}
            <div style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              paddingTop: '2px'
            }}>
              {/* Location String */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#FFFFFF" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '12px', color: '#D4D4D8', lineHeight: '1.4' }}>
                  {fullAddress}
                </span>
              </div>

              {/* Date & Time Badge Pills (Side-by-Side without wrapping) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1E1E22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF'
                }}>
                  <Calendar size={13} color="#A1A1AA" />
                  <span>{formattedDate}</span>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1E1E22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF'
                }}>
                  <Clock size={13} color="#A1A1AA" />
                  <span>{formattedTime}</span>
                </div>
              </div>

              {/* Tag Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {eventTags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: '#18181B',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      color: '#D4D4D8'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Winner Prize */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#FACC15',
                marginTop: '2px'
              }}>
                <span style={{ fontSize: '15px' }}>🏆</span>
                <span>Winner Price-{winnerPrize}</span>
              </div>

              {/* Price & Book Tickets Button */}
              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <div style={{ fontSize: '11px', color: '#71717A', marginBottom: '2px' }}>
                  Price
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
                  {priceDisplay}
                </div>

                {userRegistration ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#065F46',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    height: '42px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: '1px solid #10B981'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>Ticket Booked</span>
                  </div>
                ) : (
                  <Link
                    href={`/competitions/${event.id}/apply`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      border: '1.5px solid #EAB308',
                      borderRadius: '999px',
                      height: '42px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 4px 16px rgba(234, 179, 8, 0.2)'
                    }}
                  >
                    Book Tickets
                  </Link>
                )}
              </div>
            </div>

            {/* 3. The Organizer Card (Top Right) */}
            <div style={{
              width: '240px',
              backgroundColor: '#16161A',
              borderRadius: '22px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                The Organizer
              </div>

              {/* Organizer Avatar & Handle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#27272A',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.15)'
                }}>
                  <img
                    src={organizerAvatar || '/images/competitions/gallery_thumb1.png'}
                    alt={organizerName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  {organizerHandle}
                </div>
                <div style={{ fontSize: '10px', color: '#71717A' }}>
                  The Organizer
                </div>
              </div>

              {/* Stats Row: Followers | AP | Network */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                textAlign: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '8px 0'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{organizerFollowers}</div>
                  <div style={{ fontSize: '9px', color: '#71717A' }}>Followers</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{organizerAP}</div>
                  <div style={{ fontSize: '9px', color: '#71717A' }}>AP</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{organizerNetwork}</div>
                  <div style={{ fontSize: '9px', color: '#71717A' }}>Network</div>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  Work Experience
                </div>
                <p style={{ fontSize: '10px', color: '#A1A1AA', lineHeight: '1.4', margin: 0 }}>
                  Experienced in planning and coordinating events from concept to completion. Skilled in managing event schedules, coordinating with clients and vendors, handling registrations, and ensuring smooth event operations. Strong communication, organizational, and problem-solving and memorable events.
                </p>
              </div>

              {/* FastTicket Trust Badges */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '8px' }}>
                  FastTicket Your Reliable<br />Ticket Partner
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2px' }}>
                    <ShieldCheck size={16} color="#22C55E" />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFFFFF' }}>Secure Checkout</span>
                    <span style={{ fontSize: '8px', color: '#71717A' }}>Fast & Secured Payment</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2px' }}>
                    <CheckCircle2 size={16} color="#22C55E" />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFFFFF' }}>Instant confirmation</span>
                    <span style={{ fontSize: '8px', color: '#71717A' }}>Refund guarantee option</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2px' }}>
                    <Ticket size={16} color="#EAB308" />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFFFFF' }}>Official Ticket</span>
                    <span style={{ fontSize: '8px', color: '#71717A' }}>Used by over 10M+ people</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2px' }}>
                    <Headphones size={16} color="#EAB308" />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFFFFF' }}>24/7 Customer Service</span>
                    <span style={{ fontSize: '8px', color: '#71717A' }}>Reliable & Dedicated support</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================
              ABOUT COMPETITION
             ======================================================== */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
              About Competition
            </h2>
            <div style={{
              fontSize: '13px',
              color: '#D4D4D8',
              lineHeight: '1.6',
              whiteSpace: 'pre-line'
            }}>
              {event.description || (
                `${event.name} is a premier competition designed around discipline, athletic ability, technique, reflexes, stamina, and sportsmanship. The main idea of the competition is to bring participants together in a controlled sporting environment where they can demonstrate their skills against opponents of similar experience.\n\nThe competition begins with a registration and verification stage, where participants provide their details and previous training. Before competing, participants are placed into appropriate categories based on age, weight, and experience level. This helps make the matches balanced and fair.`
              )}
            </div>
          </div>

          {/* ========================================================
              COMPETITION LOCATION & PHOTO GALLERY + ORGANIZER CARD
             ======================================================== */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
              Competition Location
            </h2>

            {/* Location Callout Bar with Get Direction */}
            <div style={{
              backgroundColor: '#18181B',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={18} color="#EAB308" />
                </div>
                <span style={{ fontSize: '12px', color: '#E4E4E7' }}>
                  {fullAddress}
                </span>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Get Direction
              </a>
            </div>

            {/* 2-Column Split: Photo Gallery (Left) + The Organizer (Right) matching Figma media_1790074840365.png */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 240px',
              gap: '20px',
              alignItems: 'start'
            }}>
              {/* Left Column: 5-Photo Gallery Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '46% 54%',
                gap: '10px',
                height: '310px',
                borderRadius: '20px',
                overflow: 'hidden'
              }}>
                {/* Left Large Photo */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#18181B',
                  overflow: 'hidden',
                  borderRadius: '12px'
                }}>
                  <img
                    src="/images/competitions/gallery_hero.png"
                    alt="Track"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Right 2x2 Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr',
                  gap: '8px',
                  height: '100%'
                }}>
                  <div style={{ overflow: 'hidden', backgroundColor: '#18181B', borderRadius: '10px' }}>
                    <img
                      src="/images/competitions/gallery_thumb1.png"
                      alt="Training"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ overflow: 'hidden', backgroundColor: '#18181B', borderRadius: '10px' }}>
                    <img
                      src="/images/competitions/gallery_thumb2.png"
                      alt="Sprinters"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ overflow: 'hidden', backgroundColor: '#18181B', borderRadius: '10px' }}>
                    <img
                      src="/images/competitions/gallery_thumb3.png"
                      alt="Agility"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* +11 More Overlay Photo */}
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#18181B',
                    borderRadius: '10px'
                  }}>
                    <img
                      src="/images/competitions/gallery_thumb4.png"
                      alt="Runners"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700
                    }}>
                      <LayoutGrid size={15} color="#FFFFFF" />
                      <span>11 More</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: The Organizer Card (matching Figma) */}
              <div style={{
                width: '240px',
                backgroundColor: '#16161A',
                borderRadius: '22px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '18px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                  The Organizer
                </div>

                {/* Organizer Avatar & Handle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#27272A',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <img
                      src={organizerAvatar || '/images/competitions/gallery_thumb1.png'}
                      alt={organizerName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                    {organizerHandle}
                  </div>
                  <div style={{ fontSize: '10px', color: '#71717A' }}>
                    The Organizer
                  </div>
                </div>

                {/* Stats Row: Followers | AP | Network */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  textAlign: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '8px 0'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{organizerFollowers}</div>
                    <div style={{ fontSize: '9px', color: '#71717A' }}>Followers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{organizerAP}</div>
                    <div style={{ fontSize: '9px', color: '#71717A' }}>AP</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{organizerNetwork}</div>
                    <div style={{ fontSize: '9px', color: '#71717A' }}>Network</div>
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    Work Experience
                  </div>
                  <p style={{ fontSize: '10px', color: '#A1A1AA', lineHeight: '1.4', margin: 0 }}>
                    Experienced in planning and coordinating events from concept to completion. Skilled in managing event schedules, coordinating with clients and vendors, handling registrations, and ensuring smooth event operations. Strong communication, organizational, and problem-solving and memorable events.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Rail: User Profile Card & Joined Competitions */}
        <AppRightSidebar userId={userId} mode="competitions" />
      </div>
    </div>
  );
}
