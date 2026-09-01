import { prisma } from './prisma';

/**
 * Get the rank of a user for a specific geographic scope.
 * Tie-handling method: Standard ranking. If two users have the same AP, they share the rank.
 * Zero-AP behavior: Returns null ('Not Ranked') if the user has 0 AP.
 */
export async function getPersonalRank(
  userId: string,
  scope: 'INTERNATIONAL' | 'NATIONAL' | 'STATE' | 'CITY' | 'DISTRICT',
  locationValue?: string // e.g., the country name for NATIONAL
): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { amerigamPoints: true, accountType: true, country: true, state: true, city: true, district: true }
  });

  if (!user || user.accountType !== 'PERSONAL') return null;
  if (user.amerigamPoints <= 0) return null; // Zero AP -> Not Ranked

  const whereClause: any = {
    accountType: 'PERSONAL',
    amerigamPoints: { gt: user.amerigamPoints }
  };

  if (scope === 'NATIONAL') {
    if (!user.country && !locationValue) return null;
    whereClause.country = locationValue || user.country;
  } else if (scope === 'STATE') {
    if (!user.state && !locationValue) return null;
    whereClause.state = locationValue || user.state;
  } else if (scope === 'CITY') {
    if (!user.city && !locationValue) return null;
    whereClause.city = locationValue || user.city;
  } else if (scope === 'DISTRICT') {
    if (!user.district && !locationValue) return null;
    whereClause.district = locationValue || user.district;
  }

  const higherUsers = await prisma.user.count({ where: whereClause });
  return higherUsers + 1;
}

/**
 * Gets all ranks for a user efficiently.
 */
export async function getUserAllRanks(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { amerigamPoints: true, accountType: true, country: true, state: true, city: true, district: true }
  });

  if (!user || user.accountType !== 'PERSONAL' || user.amerigamPoints <= 0) {
    return {
      international: null,
      national: null,
      state: null,
      city: null,
      district: null
    };
  }

  // We can do this in parallel
  const [international, national, state, city, district] = await Promise.all([
    prisma.user.count({ where: { accountType: 'PERSONAL', amerigamPoints: { gt: user.amerigamPoints } } }),
    user.country ? prisma.user.count({ where: { accountType: 'PERSONAL', amerigamPoints: { gt: user.amerigamPoints }, country: user.country } }) : Promise.resolve(null),
    user.state ? prisma.user.count({ where: { accountType: 'PERSONAL', amerigamPoints: { gt: user.amerigamPoints }, state: user.state } }) : Promise.resolve(null),
    user.city ? prisma.user.count({ where: { accountType: 'PERSONAL', amerigamPoints: { gt: user.amerigamPoints }, city: user.city } }) : Promise.resolve(null),
    user.district ? prisma.user.count({ where: { accountType: 'PERSONAL', amerigamPoints: { gt: user.amerigamPoints }, district: user.district } }) : Promise.resolve(null),
  ]);

  return {
    international: international + 1,
    national: national !== null ? national + 1 : null,
    state: state !== null ? state + 1 : null,
    city: city !== null ? city + 1 : null,
    district: district !== null ? district + 1 : null,
  };
}

/**
 * Gets a leaderboard for a specific scope.
 */
export async function getLeaderboard(
  scope: 'INTERNATIONAL' | 'NATIONAL' | 'STATE' | 'CITY' | 'DISTRICT',
  locationValue?: string, // required if not international
  limit: number = 10,
  skip: number = 0
) {
  const whereClause: any = {
    accountType: 'PERSONAL',
    amerigamPoints: { gt: 0 }
  };

  if (scope === 'NATIONAL' && locationValue) whereClause.country = locationValue;
  else if (scope === 'STATE' && locationValue) whereClause.state = locationValue;
  else if (scope === 'CITY' && locationValue) whereClause.city = locationValue;
  else if (scope === 'DISTRICT' && locationValue) whereClause.district = locationValue;

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { amerigamPoints: 'desc' },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      username: true,
      avatarData: true,
      amerigamPoints: true,
      country: true,
      state: true,
      city: true,
      district: true,
      personalProfile: { select: { mainIdentity: true } }
    }
  });

  // Calculate real rank based on offset + same-value tie logic, or we can just fetch the count for each (slightly heavier)
  // For pagination, it's easiest to calculate rank dynamically or rely on skip.
  // Actually, we can fetch their exact rank by looking up how many are > AP.
  const leaderboard = await Promise.all(users.map(async (u) => {
    const higherCount = await prisma.user.count({
      where: { ...whereClause, amerigamPoints: { gt: u.amerigamPoints } }
    });
    return {
      ...u,
      rank: higherCount + 1
    };
  }));

  return leaderboard;
}
