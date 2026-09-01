// lib/ap-matrix.ts

/**
 * TEMPORARY PLACEHOLDERS: These are NOT final production AP values.
 * They are structural placeholders used to validate the AP Reward Engine 
 * and Geographic Ranking System. They MUST be replaced/rebalanced 
 * by the game design team before final launch.
 */
export const competitionAPMatrix = {
  Local: {
    participation: 10,
    qualified: 20,
    bronze: 30, // 3rd Place
    silver: 40, // 2nd Place
    gold: 50,   // Winner
  },
  District: {
    participation: 20,
    qualified: 40,
    bronze: 60,
    silver: 80,
    gold: 100,
  },
  State: {
    participation: 50,
    qualified: 100,
    bronze: 200,
    silver: 300,
    gold: 500,
  },
  National: {
    participation: 100,
    qualified: 250,
    bronze: 500,
    silver: 750,
    gold: 1000,
  },
  International: {
    participation: 250,
    qualified: 500,
    bronze: 1000,
    silver: 2500,
    gold: 5000,
  },
};

export const challengeAPMatrix = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
  Major: 100,
};

/**
 * Gets the configured AP for a specific competition level and result type.
 */
export function getCompetitionAP(
  level: string, 
  resultType: 'PARTICIPATION' | 'QUALIFIED' | 'BRONZE' | 'SILVER' | 'GOLD'
): number {
  const levelData = competitionAPMatrix[level as keyof typeof competitionAPMatrix];
  if (!levelData) {
    throw new Error(`Invalid or unconfigured competition level: ${level}`);
  }

  const keyMap: Record<string, keyof typeof levelData> = {
    'PARTICIPATION': 'participation',
    'QUALIFIED': 'qualified',
    'BRONZE': 'bronze',
    'SILVER': 'silver',
    'GOLD': 'gold',
  };

  const key = keyMap[resultType];
  if (!key) {
    throw new Error(`Invalid result type: ${resultType}`);
  }

  return levelData[key];
}

/**
 * Gets the configured AP for a specific challenge difficulty.
 */
export function getChallengeAP(difficulty: string): number {
  const ap = challengeAPMatrix[difficulty as keyof typeof challengeAPMatrix];
  if (ap === undefined) {
    throw new Error(`Invalid or unconfigured challenge difficulty: ${difficulty}`);
  }
  return ap;
}
