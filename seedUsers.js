const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyUsers = [
  // The Professional
  {
    email: 'alex@example.com', password: 'password123', name: 'Alex Techie', username: 'alex_tech',
    masterPath: 'The Professional', corePath: 'Tech & AI',
    hobbies: JSON.stringify(['Machine Learning', 'Open Source', 'Gaming']),
    mindset: 'Fast-paced Builders', vision: 'To Learn & Grow',
    bio: 'Building the next gen AI tools. Always coding.', location: 'San Francisco, USA', onboarded: true
  },
  {
    email: 'sarah@example.com', password: 'password123', name: 'Sarah Founder', username: 'sarah_startup',
    masterPath: 'The Professional', corePath: 'Business & Startups',
    hobbies: JSON.stringify(['Venture Capital', 'Product Management', 'Reading']),
    mindset: 'Fast-paced Builders', vision: 'To Collaborate',
    bio: 'Serial entrepreneur. Looking for a technical co-founder.', location: 'London, UK', onboarded: true
  },
  {
    email: 'raj@example.com', password: 'password123', name: 'Raj Finance', username: 'raj_crypto',
    masterPath: 'The Professional', corePath: 'Finance & Markets',
    hobbies: JSON.stringify(['Cryptocurrency', 'Stock Trading', 'Chess']),
    mindset: 'Deep Thinkers', vision: 'To Teach & Share',
    bio: 'Crypto analyst. Exploring Web3.', location: 'Mumbai, India', onboarded: true
  },

  // The Creator
  {
    email: 'mia@example.com', password: 'password123', name: 'Mia Designs', username: 'mia_art',
    masterPath: 'The Creator', corePath: 'Visual Arts',
    hobbies: JSON.stringify(['Digital Art', 'Typography', 'Photography']),
    mindset: 'Creative Souls', vision: 'To Showcase',
    bio: 'Digital artist & illustrator. Colors give me life.', location: 'Paris, France', onboarded: true
  },
  {
    email: 'jake@example.com', password: 'password123', name: 'Jake Lens', username: 'jake_video',
    masterPath: 'The Creator', corePath: 'Media & Lens',
    hobbies: JSON.stringify(['Filmmaking', 'Color Grading', 'Traveling']),
    mindset: 'Creative Souls', vision: 'To Collaborate',
    bio: 'Indie filmmaker. Always got a camera in hand.', location: 'Los Angeles, USA', onboarded: true
  },
  {
    email: 'emma@example.com', password: 'password123', name: 'Emma Writer', username: 'emma_words',
    masterPath: 'The Creator', corePath: 'Words & Design',
    hobbies: JSON.stringify(['Copywriting', 'Poetry', 'Reading']),
    mindset: 'Deep Thinkers', vision: 'To Teach & Share',
    bio: 'Wordsmith. Freelance copywriter.', location: 'New York, USA', onboarded: true
  },

  // The Athlete
  {
    email: 'leo@example.com', password: 'password123', name: 'Leo Muscle', username: 'leo_gym',
    masterPath: 'The Athlete', corePath: 'Fitness & Strength',
    hobbies: JSON.stringify(['Powerlifting', 'CrossFit', 'Fitness & Gym']),
    mindset: 'Fast-paced Builders', vision: 'To Learn & Grow',
    bio: 'Gym is my therapy. Personal trainer.', location: 'Sydney, Australia', onboarded: true
  },
  {
    email: 'khalid@example.com', password: 'password123', name: 'Khalid Fighter', username: 'khalid_mma',
    masterPath: 'The Athlete', corePath: 'Combat & Martial Arts',
    hobbies: JSON.stringify(['MMA', 'Boxing', 'Yoga & Meditation']),
    mindset: 'Deep Thinkers', vision: 'To Showcase',
    bio: 'Amateur MMA fighter. Discipline is everything.', location: 'Dubai, UAE', onboarded: true
  },

  // The Explorer
  {
    email: 'zoe@example.com', password: 'password123', name: 'Zoe Travel', username: 'zoe_globe',
    masterPath: 'The Explorer', corePath: 'Travel & Culture',
    hobbies: JSON.stringify(['Backpacking', 'Food Vlogging', 'Photography']),
    mindset: 'Casual Explorers', vision: 'To Explore & Adventure',
    bio: '30 countries and counting. Will travel for food.', location: 'Bali, Indonesia', onboarded: true
  },
  {
    email: 'omar@example.com', password: 'password123', name: 'Omar Phil', username: 'omar_think',
    masterPath: 'The Explorer', corePath: 'The Philosophers',
    hobbies: JSON.stringify(['Stoicism', 'Psychology', 'Reading']),
    mindset: 'Deep Thinkers', vision: 'To Learn & Grow',
    bio: 'Seeking truth in a noisy world. Philosophy student.', location: 'Berlin, Germany', onboarded: true
  }
];

async function main() {
  console.log('Seeding dummy users...');
  
  for (const user of dummyUsers) {
    // Upsert so we don't crash if they already exist
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
  
  console.log(`Successfully seeded ${dummyUsers.length} dummy users!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
