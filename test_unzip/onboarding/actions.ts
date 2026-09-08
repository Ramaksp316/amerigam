'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getCurrentUserId() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/signin')
  return userId
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  const userId = await getCurrentUserId()
  const existing = await prisma.user.findFirst({
    where: { username, NOT: { id: userId } }
  })
  return { available: !existing }
}

export async function completePersonalOnboarding(data: {
  username: string
  bio?: string
  avatarUrl?: string
  location?: string
  country?: string
  state?: string
  city?: string
  field?: string
  profession?: string
  organizationName?: string
  organizationId?: string
  skills?: string[]
  interests?: string[]
  hobbies?: string[]
  organizationJoinKey?: string
}) {
  const userId = await getCurrentUserId()

  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } }
    })
    if (existing) return { error: 'Username already taken. Please choose another.' }
  }

  // VALIDATE JOIN KEY
  if (data.organizationId) {
    const org = await prisma.user.findUnique({
      where: { id: data.organizationId },
      select: { joinKey: true }
    });
    
    // Check if this org has any existing connections
    const existingConnections = await prisma.entityConnection.count({
      where: { targetId: data.organizationId }
    });
    
    // Only require joinKey if the org already has employees/founders
    if (existingConnections > 0 && org && org.joinKey && org.joinKey !== data.organizationJoinKey) {
      return { error: 'Invalid Join Key for this Business/Organization.' }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username || undefined,
      bio: data.bio || null,
      avatarData: data.avatarUrl || null,
      location: data.location ? `${data.city ? data.city + ', ' : ''}${data.state ? data.state + ', ' : ''}${data.country || ''}`.trim().replace(/,\s*$/, '') : null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      onboarded: true,
    }
  })

  await prisma.personalProfile.upsert({
    where: { userId },
    create: {
      userId,
      mainIdentity: data.profession
        ? `${data.profession}${data.field ? ' • ' + data.field : ''}`
        : null,
      skills: data.skills?.length ? JSON.stringify(data.skills) : null,
      interests: data.interests?.length ? JSON.stringify(data.interests) : null,
      hobbies: data.hobbies?.length ? JSON.stringify(data.hobbies) : null,
    },
    update: {
      mainIdentity: data.profession
        ? `${data.profession}${data.field ? ' • ' + data.field : ''}`
        : null,
      skills: data.skills?.length ? JSON.stringify(data.skills) : null,
      interests: data.interests?.length ? JSON.stringify(data.interests) : null,
      hobbies: data.hobbies?.length ? JSON.stringify(data.hobbies) : null,
    }
  })

  if (data.organizationId) {
    const isFounderRole = !!(data.profession && /founder|ceo|owner|organizer|creator/i.test(data.profession));
    
    // Check if this org has any existing connections
    const existingConnections = await prisma.entityConnection.count({
      where: { targetId: data.organizationId }
    });

    const isActuallyFounder = existingConnections === 0 || isFounderRole;

    await prisma.entityConnection.create({
      data: {
        sourceId: userId,
        targetId: data.organizationId,
        role: data.profession || (isActuallyFounder ? 'Founder' : 'Employee'),
        relationshipType: isActuallyFounder ? 'FOUNDER' : 'EMPLOYEE',
        isFounder: isActuallyFounder,
        isCoFounder: false,
        status: 'CURRENT',
      }
    });
  }

  revalidatePath('/home')
  redirect('/home')
}

export async function searchOrganizations(query: string) {
  if (!query || query.length < 2) return [];
  const results = await prisma.user.findMany({
    where: {
      OR: [
        { accountType: 'BUSINESS' },
        { accountType: 'ORGANIZATION' }
      ],
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarData: true,
      accountType: true
    },
    take: 5
  });
  return results;
}

export async function createOrganizationInline(data: {
  accountType: 'BUSINESS' | 'ORGANIZATION'
  name: string
  username: string
  industry?: string
  stage?: string
  website?: string
  bio?: string
  city?: string
  country?: string
}) {
  if (!data.name || !data.username) return { error: 'Name and Username are required.' };
  
  const existing = await prisma.user.findFirst({
    where: { username: data.username }
  });
  if (existing) return { error: 'Username already taken.' };

  const joinKey = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newOrg = await prisma.user.create({
    data: {
      accountType: data.accountType,
      name: data.name,
      username: data.username,
      email: `${data.username}-${Date.now()}@managed.amerigam.com`,
      password: 'MANAGED_ACCOUNT_NO_LOGIN',
      bio: data.bio || null,
      city: data.city || null,
      country: data.country || null,
      location: data.city ? `${data.city}, ${data.country || ''}`.trim().replace(/^, /, '') : data.country,
      onboarded: true,
      joinKey,
    }
  });

  if (data.accountType === 'BUSINESS') {
    await prisma.businessProfile.create({
      data: {
        userId: newOrg.id,
        industry: data.industry,
        stage: data.stage,
      }
    });
  } else if (data.accountType === 'ORGANIZATION') {
    await prisma.orgProfile.create({
      data: {
        userId: newOrg.id,
        organizationType: data.industry, // Re-using industry as type for simplicity
      }
    });
  }

  return { success: true, orgId: newOrg.id, orgName: newOrg.name, orgUsername: newOrg.username, orgType: newOrg.accountType };
}

export async function completeBusinessOnboarding(data: {
  username: string
  businessName?: string
  bio?: string
  avatarUrl?: string
  location?: string
  country?: string
  industry?: string
  stage?: string
  website?: string
}) {
  const userId = await getCurrentUserId()

  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } }
    })
    if (existing) return { error: 'Username already taken.' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username || undefined,
      name: data.businessName || undefined,
      bio: data.bio || null,
      avatarData: data.avatarUrl || null,
      location: data.location || null,
      country: data.country || null,
      onboarded: true,
    }
  })

  await prisma.businessProfile.upsert({
    where: { userId },
    create: { userId, industry: data.industry || null, stage: data.stage || null },
    update: { industry: data.industry || null, stage: data.stage || null },
  })

  revalidatePath('/home')
  redirect('/home')
}

export async function completeCreatorOnboarding(data: {
  username: string
  bio?: string
  avatarUrl?: string
  creatorType?: string
  niche?: string
}) {
  const userId = await getCurrentUserId()

  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } }
    })
    if (existing) return { error: 'Username already taken.' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username || undefined,
      bio: data.bio || null,
      avatarData: data.avatarUrl || null,
      onboarded: true,
    }
  })

  await prisma.creatorProfile.upsert({
    where: { userId },
    create: { userId, creatorType: data.creatorType || null, niche: data.niche || null },
    update: { creatorType: data.creatorType || null, niche: data.niche || null },
  })

  revalidatePath('/home')
  redirect('/home')
}

export async function completeInfluencerOnboarding(data: {
  username: string
  bio?: string
  avatarUrl?: string
  influencerType?: string
  mainNiche?: string
}) {
  const userId = await getCurrentUserId()

  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } }
    })
    if (existing) return { error: 'Username already taken.' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username || undefined,
      bio: data.bio || null,
      avatarData: data.avatarUrl || null,
      onboarded: true,
    }
  })

  await prisma.influencerProfile.upsert({
    where: { userId },
    create: { userId, influencerType: data.influencerType || null, mainNiche: data.mainNiche || null },
    update: { influencerType: data.influencerType || null, mainNiche: data.mainNiche || null },
  })

  revalidatePath('/home')
  redirect('/home')
}

export async function completeOrgOnboarding(data: {
  username: string
  orgName?: string
  bio?: string
  avatarUrl?: string
  orgType?: string
  location?: string
  country?: string
}) {
  const userId = await getCurrentUserId()

  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } }
    })
    if (existing) return { error: 'Username already taken.' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username || undefined,
      name: data.orgName || undefined,
      bio: data.bio || null,
      avatarData: data.avatarUrl || null,
      location: data.location || null,
      country: data.country || null,
      onboarded: true,
    }
  })

  await prisma.organizationProfile.upsert({
    where: { userId },
    create: { userId, orgType: data.orgType || null },
    update: { orgType: data.orgType || null },
  })

  revalidatePath('/home')
  redirect('/home')
}
