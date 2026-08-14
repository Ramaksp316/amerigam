import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

const personalAccounts = [
  { name: 'Aarav Mehta', username: '@aaravbuilds', identity: 'Aspiring Founder', interests: ['Startups', 'AI', 'Business'], hobbies: ['Reading', 'Networking', 'Podcasts'], skills: ['Pitching', 'Research', 'Strategy'] },
  { name: 'Diya Shah', username: '@diyadraws', identity: 'Digital Artist', interests: ['Illustration', 'Animation', 'Design'], hobbies: ['Sketching', 'Anime', 'Painting'], skills: ['Procreate', 'Character Art', 'Color Theory'] },
  { name: 'Rohan Verma', username: '@rohan.cuts', identity: 'Video Editor', interests: ['Filmmaking', 'Editing', 'Content'], hobbies: ['Movies', 'Photography', 'Music'], skills: ['Premiere Pro', 'After Effects', 'Storytelling'] },
  { name: 'Kabir Singh', username: '@kabir.runs', identity: 'Athlete / Runner', interests: ['Athletics', 'Fitness', 'Sports'], hobbies: ['Running', 'Cycling', 'Hiking'], skills: ['Sprinting', 'Endurance', 'Discipline'] },
  { name: 'Ishaan Patel', username: '@ishaan.codes', identity: 'App Developer', interests: ['Coding', 'AI', 'Startups'], hobbies: ['Gaming', 'Tech Videos', 'Chess'], skills: ['JavaScript', 'React', 'Python'] },
  { name: 'Meera Joshi', username: '@meeraframes', identity: 'Photographer', interests: ['Photography', 'Travel', 'Art'], hobbies: ['Street Walks', 'Editing', 'Exploring Cafés'], skills: ['Portrait Photography', 'Lightroom', 'Composition'] },
  { name: 'Arjun Nair', username: '@arjunstrings', identity: 'Musician', interests: ['Music', 'Production', 'Performing'], hobbies: ['Guitar', 'Singing', 'Songwriting'], skills: ['Guitar', 'Music Production', 'Arrangement'] },
  { name: 'Ananya Rao', username: '@speakwithananya', identity: 'Public Speaker', interests: ['Communication', 'Leadership', 'Psychology'], hobbies: ['Debating', 'Reading', 'Volunteering'], skills: ['Speaking', 'Presentation', 'Storytelling'] },
  { name: 'Yash Kapoor', username: '@yashplays', identity: 'Gamer / Game Builder', interests: ['Gaming', 'Game Design', 'Tech'], hobbies: ['Esports', 'Streaming', '3D Games'], skills: ['Unity', 'Level Design', 'Game Testing'] },
  { name: 'Kavya Desai', username: '@kavyawrites', identity: 'Writer', interests: ['Writing', 'Philosophy', 'Creativity'], hobbies: ['Journaling', 'Reading', 'Poetry'], skills: ['Creative Writing', 'Copywriting', 'Editing'] },
  { name: 'Advait Kulkarni', username: '@advait.design', identity: 'UI/UX Designer', interests: ['Product Design', 'Branding', 'Tech'], hobbies: ['Sketching Interfaces', 'Music', 'Gaming'], skills: ['Figma', 'UX Research', 'Prototyping'] },
  { name: 'Sana Khan', username: '@sanainvents', identity: 'Student Innovator', interests: ['Science', 'Robotics', 'Sustainability'], hobbies: ['DIY Projects', 'Experiments', 'Reading'], skills: ['Prototyping', 'Research', 'Problem Solving'] },
  { name: 'Reyansh Sharma', username: '@reyanshfc', identity: 'Football Player', interests: ['Football', 'Fitness', 'Sports Science'], hobbies: ['Training', 'Gaming', 'Watching Matches'], skills: ['Dribbling', 'Teamwork', 'Stamina'] },
  { name: 'Tara Malhotra', username: '@tarafilms', identity: 'Filmmaker', interests: ['Cinema', 'Direction', 'Photography'], hobbies: ['Watching Films', 'Writing Scenes', 'Travel'], skills: ['Direction', 'Cinematography', 'Scriptwriting'] },
  { name: 'Vivaan Gupta', username: '@vivaanexplores', identity: 'Multi-skill Explorer', interests: ['Entrepreneurship', 'Tech', 'Design', 'Fitness'], hobbies: ['Learning New Skills', 'Cycling', 'Reading'], skills: ['Basic Coding', 'Design', 'Communication'] }
];

const businessAccounts = [
  { name: 'NovaNest AI', username: '@novanestai', industry: 'AI / SaaS', stage: 'Early Startup', focus: 'AI productivity tools for small teams' },
  { name: 'Veyra Studio', username: '@veyrastudio', industry: 'Creative Agency', stage: 'Growing Agency', focus: 'Branding, UI/UX, video production' },
  { name: 'StrideCore', username: '@stridecore', industry: 'Sports & Fitness', stage: 'Growing Brand', focus: 'Athlete apparel and performance gear' },
  { name: 'ByteBloom Labs', username: '@bytebloom', industry: 'Software', stage: 'Startup', focus: 'Mobile apps and custom software' },
  { name: 'GreenGrid Energy', username: '@greengrid', industry: 'Clean Energy', stage: 'Growth Startup', focus: 'Solar and energy-saving solutions' },
  { name: 'CraveStreet Foods', username: '@cravestreet', industry: 'Food & Beverage', stage: 'Local Growth Brand', focus: 'Snacks, quick food and cloud kitchens' },
  { name: 'PixelForge Games', username: '@pixelforgegames', industry: 'Gaming', stage: 'Indie Studio', focus: 'Mobile and PC games' },
  { name: 'EduSpark', username: '@eduspark', industry: 'EdTech', stage: 'Startup', focus: 'Skill-based learning for students' },
  { name: 'Threadora', username: '@threadora', industry: 'Fashion', stage: 'D2C Brand', focus: 'Modern streetwear and youth fashion' },
  { name: 'Finora', username: '@finora', industry: 'FinTech', stage: 'Early Startup', focus: 'Money management tools for young adults' },
  { name: 'MotionMint Media', username: '@motionmint', industry: 'Media / Production', stage: 'Creative Company', focus: 'Ads, films, content production' },
  { name: 'AgroLink', username: '@agrolink', industry: 'AgriTech', stage: 'Startup', focus: 'Connecting farmers with buyers and tools' },
  { name: 'MechNova Industries', username: '@mechnova', industry: 'Manufacturing', stage: 'Established SME', focus: 'Precision components and industrial parts' },
  { name: 'HomeRoot', username: '@homeroot', industry: 'Interior / Home', stage: 'Growing Business', focus: 'Interior design and modular spaces' },
  { name: 'LaunchBridge', username: '@launchbridge', industry: 'Startup Services', stage: 'Consulting / Incubator', focus: 'Helps founders validate and launch ideas' }
];

const creatorAccounts = [
  { name: 'Tech Burner', username: '@imkhub', niche: 'Gadgets, experiments, tech entertainment', type: 'Tech Creator', audience: '12.5M' },
  { name: 'Total Gaming', username: '@totalgaming093', niche: 'Gaming, gameplay', type: 'Gaming Creator', audience: '45.8M' },
  { name: 'Slayy Point', username: '@slayypointofficial', niche: 'Comedy, internet culture', type: 'Entertainment Duo', audience: '10.6M' },
  { name: 'Ryan Trahan', username: '@ryan', niche: 'Challenges, experiments, storytelling', type: 'Entertainment Creator', audience: '23.7M' },
  { name: 'Techno Gamerz', username: '@technogamerzofficial', niche: 'Gaming storytelling', type: 'Gaming Creator', audience: '52.8M' },
  { name: 'Neel Creates', username: '@neelcreates', niche: 'Drawing, digital art, illustration', type: 'Creative Creator', audience: '680K' },
  { name: 'Aanya Frames', username: '@aanyaframes', niche: 'Photography, editing, cinematic shots', type: 'Photography Creator', audience: '215K' },
  { name: 'Edit With Ved', username: '@editwithved', niche: 'Video editing, VFX, transitions', type: 'Editing Creator', audience: '92K' },
  { name: 'Build With Krish', username: '@buildwithkrish', niche: 'Startups, building products, entrepreneurship', type: 'Startup Creator', audience: '340K' },
  { name: 'Code With Rivan', username: '@codewithrivan', niche: 'Web dev, AI projects, app building', type: 'Coding Creator', audience: '1.1M' },
  { name: 'Fit With Aarush', username: '@fitwithaarush', niche: 'Running, football, fitness education', type: 'Sports Creator', audience: '470K' },
  { name: 'Mira Makes', username: '@miramakes', niche: 'DIY projects, crafts, prototypes', type: 'DIY / Maker', audience: '155K' },
  { name: 'Lens By Tara', username: '@lensbytara', niche: 'Cinematography, filmmaking, short films', type: 'Filmmaking Creator', audience: '62K' },
  { name: 'Dev Plays Indie', username: '@devplaysindie', niche: 'Indie games, reviews, game development', type: 'Gaming Creator', audience: '24K' },
  { name: 'The Curious Kunal', username: '@thecuriouskunal', niche: 'Science, psychology, explainers', type: 'Education Creator', audience: '2.4M' }
];

const influencerAccounts = [
  { name: 'Riya Malhotra', username: '@riyamalhotra', type: 'Lifestyle Influencer', niche: 'Fashion, daily life, travel', size: '1.8M' },
  { name: 'Arnav Khanna', username: '@arnavmoves', type: 'Fitness Influencer', niche: 'Fitness, running, discipline', size: '620K' },
  { name: 'Mehak Jain', username: '@mehakstyle', type: 'Fashion Influencer', niche: 'Styling, streetwear, beauty', size: '950K' },
  { name: 'Veer Patel', username: '@veeronroad', type: 'Travel Influencer', niche: 'Travel, exploration, experiences', size: '410K' },
  { name: 'Shanaya Roy', username: '@shanayaeats', type: 'Food Influencer', niche: 'Food discovery, cafés, restaurants', size: '1.2M' },
  { name: 'Dhruv Mehta', username: '@dhruvbuilds', type: 'Business Influencer', niche: 'Startups, money, entrepreneurship', size: '780K' },
  { name: 'Ishita Kapoor', username: '@ishitawellness', type: 'Wellness Influencer', niche: 'Healthy habits, mindfulness, routines', size: '320K' },
  { name: 'Aryan Bose', username: '@aryanstyle', type: 'Men’s Lifestyle Influencer', niche: 'Fashion, grooming, lifestyle', size: '540K' },
  { name: 'Naina Shah', username: '@nainabeauty', type: 'Beauty Influencer', niche: 'Skincare, makeup, beauty', size: '2.1M' },
  { name: 'Karan Sethi', username: '@karanmotors', type: 'Auto Influencer', niche: 'Cars, bikes, automotive lifestyle', size: '870K' },
  { name: 'Zoya Khan', username: '@zoyacampus', type: 'Student Influencer', niche: 'College life, productivity, youth', size: '185K' },
  { name: 'Vihaan Joshi', username: '@vihaanfootball', type: 'Sports Influencer', niche: 'Football, sports culture', size: '1.4M' },
  { name: 'Myra Desai', username: '@myrahomes', type: 'Interior Influencer', niche: 'Interiors, décor, home lifestyle', size: '275K' },
  { name: 'Abeer Nair', username: '@abeertechlife', type: 'Tech Lifestyle Influencer', niche: 'Tech lifestyle, productivity, gadgets', size: '690K' },
  { name: 'Tara Bansal', username: '@tarasocial', type: 'Social Impact Influencer', niche: 'Education, volunteering, youth causes', size: '145K' }
];

const organizationAccounts = [
  { name: 'IgniteX Campus League', username: '@ignitexleague', type: 'Inter-college innovation', audience: 'College students' },
  { name: 'CodeRush India', username: '@coderushindia', type: 'Hackathons / coding', audience: 'Developers & students' },
  { name: 'ArtSphere Collective', username: '@artsphere', type: 'Drawing / illustration', audience: 'Artists & designers' },
  { name: 'PitchArena', username: '@pitcharena', type: 'Startup pitching', audience: 'Founders & aspiring entrepreneurs' },
  { name: 'NextGen Sports League', username: '@nextgensports', type: 'Multi-sport tournaments', audience: 'Athletes' },
  { name: 'FrameFest India', username: '@framefest', type: 'Short film / filmmaking', audience: 'Filmmakers & editors' },
  { name: 'SpeakUp Championship', username: '@speakupchamp', type: 'Debate / public speaking', audience: 'Students & speakers' },
  { name: 'GameGrid Esports', username: '@gamegridesports', type: 'Gaming / esports', audience: 'Gamers' },
  { name: 'LensQuest', username: '@lensquest', type: 'Photography contests', audience: 'Photographers' },
  { name: 'Buildathon India', username: '@buildathon', type: 'Product / prototype building', audience: 'Makers & innovators' },
  { name: 'Rhythm Clash', username: '@rhythmclash', type: 'Singing / music', audience: 'Musicians & singers' },
  { name: 'DesignSprint League', username: '@designsprint', type: 'UI/UX / graphic design', audience: 'Designers' },
  { name: 'FitBattle India', username: '@fitbattle', type: 'Fitness challenges', audience: 'Fitness & sports community' },
  { name: 'Young Minds Olympiad', username: '@youngminds', type: 'Knowledge / problem solving', audience: 'School & college students' },
  { name: 'Creator Clash India', username: '@creatorclash', type: 'Content creation challenges', audience: 'Creators & influencers' }
];

const extraPersonalAccounts = [
  'Kunal Shah', 'Rhea Kapoor', 'Manav Desai', 'Priya Nair', 'Dev Arora', 'Akash Patel', 'Neha Mehta', 'Harsh Vora', 
  'Rishi Menon', 'Sana Rao', 'Aditya Bose', 'Kavya Jain', 'Arjun Sethi', 'Mira Shah', 'Yuvan Deshmukh',
  'Reyansh Malhotra', 'Nisha Verma', 'Ishaan Trivedi', 'Aditi Menon', 'Raghav Bansal', 'Simran Joshi', 
  'Kabir Arora', 'Tanya Mehta', 'Pranav Patel', 'Riddhi Shah', 'Anika Desai', 'Varun Nair', 'Siddharth Jain', 'Isha Kapoor',
  'Vedant Rao', 'Siya Mehta', 'Rohan Kapoor', 'Nikhil Shah', 'Aditi Rao', 'Arjun Patel', 'Meera Jain', 'Kabir Bose',
  'Aayush Mehta', 'Janvi Shah', 'Rohan Nair', 'Meera Joshi', 'Dev Malhotra', 'Priyanshi Rao', 'Krish Patel', 'Ananya Desai',
  'Yash Mehta', 'Riya Nair', 'Aarav Bose', 'Sana Kapoor', 'Ved Shah', 'Diya Mehta', 'Arjun Joshi',
  'Tara Menon', 'Karan Bhatia', 'Rhea Kulkarni', 'Aditya Shah', 'Neil Arora', 'Kavya Patel', 'Armaan Joshi', 'Sana Mehra',
  'Rishabh Nair', 'Mira Desai', 'Veer Kapoor', 'Aditi Shah', 'Devansh Mehta', 'Priya Rao'
];

const connections = [
  { person: 'Kunal Shah', role: 'Founder', org: 'NovaNest AI', isFounder: true },
  { person: 'Rhea Kapoor', role: 'Co-founder', org: 'NovaNest AI', isFounder: true },
  { person: 'Manav Desai', role: 'CTO', org: 'NovaNest AI', isFounder: false },
  { person: 'Priya Nair', role: 'Founder', org: 'Veyra Studio', isFounder: true },
  { person: 'Dev Arora', role: 'Co-founder', org: 'Veyra Studio', isFounder: true },
  { person: 'Akash Patel', role: 'Founder', org: 'GreenGrid Energy', isFounder: true },
  { person: 'Neha Mehta', role: 'COO', org: 'GreenGrid Energy', isFounder: false },
  { person: 'Harsh Vora', role: 'Founder', org: 'CraveStreet Foods', isFounder: true },
  { person: 'Rishi Menon', role: 'Founder', org: 'PixelForge Games', isFounder: true },
  { person: 'Sana Rao', role: 'Co-founder', org: 'PixelForge Games', isFounder: true },
  { person: 'Aditya Bose', role: 'Founder', org: 'EduSpark', isFounder: true },
  { person: 'Kavya Jain', role: 'Head of Learning', org: 'EduSpark', isFounder: false },
  { person: 'Arjun Sethi', role: 'Founder', org: 'Threadora', isFounder: true },
  { person: 'Mira Shah', role: 'Creative Lead', org: 'Threadora', isFounder: false },
  { person: 'Yuvan Deshmukh', role: 'Founder', org: 'MechNova Industries', isFounder: true },
  { person: 'Reyansh Malhotra', role: 'Founder', org: 'StrideCore', isFounder: true },
  { person: 'Nisha Verma', role: 'Co-founder', org: 'StrideCore', isFounder: true },
  { person: 'Ishaan Trivedi', role: 'Founder & CEO', org: 'ByteBloom Labs', isFounder: true },
  { person: 'Aditi Menon', role: 'CTO', org: 'ByteBloom Labs', isFounder: false },
  { person: 'Raghav Bansal', role: 'Founder', org: 'Finora', isFounder: true },
  { person: 'Simran Joshi', role: 'Co-founder & Product Lead', org: 'Finora', isFounder: true },
  { person: 'Kabir Arora', role: 'Founder & Creative Director', org: 'MotionMint Media', isFounder: true },
  { person: 'Tanya Mehta', role: 'Head of Production', org: 'MotionMint Media', isFounder: false },
  { person: 'Pranav Patel', role: 'Founder', org: 'AgroLink', isFounder: true },
  { person: 'Riddhi Shah', role: 'COO', org: 'AgroLink', isFounder: false },
  { person: 'Anika Desai', role: 'Founder & Design Director', org: 'HomeRoot', isFounder: true },
  { person: 'Varun Nair', role: 'Co-founder', org: 'HomeRoot', isFounder: true },
  { person: 'Siddharth Jain', role: 'Founder', org: 'LaunchBridge', isFounder: true },
  { person: 'Isha Kapoor', role: 'Co-founder & Growth Lead', org: 'LaunchBridge', isFounder: true },
  
  { person: 'Vedant Rao', role: 'Video Editor', org: 'Neel Creates', isFounder: false },
  { person: 'Siya Mehta', role: 'Content Manager', org: 'Neel Creates', isFounder: false },
  { person: 'Rohan Kapoor', role: 'Camera Operator', org: 'Aanya Frames', isFounder: false },
  { person: 'Nikhil Shah', role: 'Thumbnail Designer', org: 'Build With Krish', isFounder: false },
  { person: 'Aditi Rao', role: 'Researcher', org: 'The Curious Kunal', isFounder: false },
  { person: 'Arjun Patel', role: 'Producer', org: 'Lens By Tara', isFounder: false },
  { person: 'Meera Jain', role: 'Community Manager', org: 'Code With Rivan', isFounder: false },
  { person: 'Kabir Bose', role: 'Esports/Content Manager', org: 'Dev Plays Indie', isFounder: false },

  { person: 'Aayush Mehta', role: 'Founder', org: 'IgniteX Campus League', isFounder: true },
  { person: 'Janvi Shah', role: 'Co-founder / Operations', org: 'IgniteX Campus League', isFounder: true },
  { person: 'Rohan Nair', role: 'Technical Lead', org: 'CodeRush India', isFounder: false },
  { person: 'Meera Joshi', role: 'Event Director', org: 'CodeRush India', isFounder: false }, // Wait, Meera Joshi is also a personal account (photographer). Will reuse!
  { person: 'Dev Malhotra', role: 'Founder', org: 'ArtSphere Collective', isFounder: true },
  { person: 'Priyanshi Rao', role: 'Community Lead', org: 'ArtSphere Collective', isFounder: false },
  { person: 'Krish Patel', role: 'Founder', org: 'PitchArena', isFounder: true },
  { person: 'Ananya Desai', role: 'Partnerships Lead', org: 'PitchArena', isFounder: false },
  { person: 'Yash Mehta', role: 'Tournament Director', org: 'NextGen Sports League', isFounder: false },
  { person: 'Riya Nair', role: 'Event Operations', org: 'NextGen Sports League', isFounder: false },
  { person: 'Aarav Bose', role: 'Founder', org: 'GameGrid Esports', isFounder: true },
  { person: 'Sana Kapoor', role: 'Esports Operations', org: 'GameGrid Esports', isFounder: false },
  { person: 'Ved Shah', role: 'Founder', org: 'Buildathon India', isFounder: true },
  { person: 'Diya Mehta', role: 'Program Manager', org: 'Buildathon India', isFounder: false },
  { person: 'Arjun Joshi', role: 'Founder', org: 'Creator Clash India', isFounder: true },
  { person: 'Tara Menon', role: 'Founder', org: 'FrameFest India', isFounder: true },
  { person: 'Karan Bhatia', role: 'Festival Director', org: 'FrameFest India', isFounder: false },
  { person: 'Rhea Kulkarni', role: 'Founder', org: 'SpeakUp Championship', isFounder: true },
  { person: 'Aditya Shah', role: 'Program Director', org: 'SpeakUp Championship', isFounder: false },
  { person: 'Neil Arora', role: 'Founder', org: 'LensQuest', isFounder: true },
  { person: 'Kavya Patel', role: 'Community & Events Lead', org: 'LensQuest', isFounder: false },
  { person: 'Armaan Joshi', role: 'Founder', org: 'Rhythm Clash', isFounder: true },
  { person: 'Sana Mehra', role: 'Artist Relations Lead', org: 'Rhythm Clash', isFounder: false },
  { person: 'Rishabh Nair', role: 'Founder', org: 'DesignSprint League', isFounder: true },
  { person: 'Mira Desai', role: 'Design Program Lead', org: 'DesignSprint League', isFounder: false },
  { person: 'Veer Kapoor', role: 'Founder', org: 'FitBattle India', isFounder: true },
  { person: 'Aditi Shah', role: 'Competition Operations Lead', org: 'FitBattle India', isFounder: false },
  { person: 'Devansh Mehta', role: 'Founder', org: 'Young Minds Olympiad', isFounder: true },
  { person: 'Priya Rao', role: 'Academic Program Director', org: 'Young Minds Olympiad', isFounder: false }
];

async function main() {
  console.log('Seeding new accounts and connections...');
  const userMap = new Map(); // Maps names to User IDs

  const getEmail = (username: string) => `${username.replace('@', '')}@amerigam.com`;
  const getPassword = () => 'password123';

  // 1. Create Extra Personal Accounts (for team members)
  for (const name of extraPersonalAccounts) {
    const username = `@${name.toLowerCase().replace(' ', '')}`;
    const user = await prisma.user.upsert({
      where: { email: getEmail(username) },
      update: {},
      create: { name, username, email: getEmail(username), password: getPassword(), accountType: AccountType.PERSONAL }
    });
    userMap.set(name, user.id);
  }

  // 2. Personal Accounts (Full profiles)
  for (const acc of personalAccounts) {
    const user = await prisma.user.upsert({
      where: { email: getEmail(acc.username) },
      update: {},
      create: { 
        name: acc.name, username: acc.username, email: getEmail(acc.username), password: getPassword(), accountType: AccountType.PERSONAL,
        personalProfile: {
          create: { mainIdentity: acc.identity, interests: JSON.stringify(acc.interests), skills: JSON.stringify(acc.skills), hobbies: JSON.stringify(acc.hobbies) }
        }
      }
    });
    userMap.set(acc.name, user.id);
  }

  // 3. Business Accounts
  for (const acc of businessAccounts) {
    const user = await prisma.user.upsert({
      where: { email: getEmail(acc.username) },
      update: {},
      create: { 
        name: acc.name, username: acc.username, email: getEmail(acc.username), password: getPassword(), accountType: AccountType.BUSINESS,
        businessProfile: { create: { industry: acc.industry, stage: acc.stage, mainFocus: acc.focus } }
      }
    });
    userMap.set(acc.name, user.id);
  }

  // 4. Creator Accounts
  for (const acc of creatorAccounts) {
    const user = await prisma.user.upsert({
      where: { email: getEmail(acc.username) },
      update: {},
      create: { 
        name: acc.name, username: acc.username, email: getEmail(acc.username), password: getPassword(), accountType: AccountType.CREATOR,
        creatorProfile: { create: { creatorType: acc.type, niche: acc.niche, audienceLevel: acc.audience } }
      }
    });
    userMap.set(acc.name, user.id);
  }

  // 5. Influencer Accounts
  for (const acc of influencerAccounts) {
    const user = await prisma.user.upsert({
      where: { email: getEmail(acc.username) },
      update: {},
      create: { 
        name: acc.name, username: acc.username, email: getEmail(acc.username), password: getPassword(), accountType: AccountType.INFLUENCER,
        influencerProfile: { create: { influencerType: acc.type, mainNiche: acc.niche, audienceSize: acc.size } }
      }
    });
    userMap.set(acc.name, user.id);
  }

  // 6. Organization Accounts
  for (const acc of organizationAccounts) {
    const user = await prisma.user.upsert({
      where: { email: getEmail(acc.username) },
      update: {},
      create: { 
        name: acc.name, username: acc.username, email: getEmail(acc.username), password: getPassword(), accountType: AccountType.ORGANIZATION,
        orgProfile: { create: { orgType: acc.type, mainAudience: acc.audience } }
      }
    });
    userMap.set(acc.name, user.id);
  }

  // 7. Map Connections
  for (const conn of connections) {
    const sourceId = userMap.get(conn.person);
    const targetId = userMap.get(conn.org);
    if (!sourceId || !targetId) {
      console.warn(`Could not find IDs for connection: ${conn.person} -> ${conn.org}`);
      continue;
    }
    
    // Check if connection exists
    const existing = await prisma.entityConnection.findFirst({ where: { sourceId, targetId, role: conn.role } });
    if (!existing) {
      await prisma.entityConnection.create({
        data: {
          sourceId, targetId, role: conn.role, 
          relationshipType: conn.isFounder ? 'FOUNDER' : 'TEAM_MEMBER',
          isFounder: conn.isFounder,
          isCoFounder: conn.role.toLowerCase().includes('co-founder')
        }
      });
    }
  }

  console.log('Seeding complete! Seeded ~88 entities and their connections.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
