const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROLES_DATA = [
  // --- DEVELOPERS ---
  {
    name: 'Ishaan Patel',
    username: 'ishaan.codes',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    bio: 'Full-stack & mobile apps developer. Building high-performance software with React Native & Rust.',
    role: 'Full-Stack Developer',
    skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'Rust', 'Next.js']),
    interests: JSON.stringify(['AI', 'Distributed Systems', 'Open Source']),
    category: 'developer'
  },
  {
    name: 'Aarav Sharma',
    username: 'aarav_dev',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    bio: 'AI & Machine Learning engineer. Fine-tuning vision models & scalable API architectures.',
    role: 'AI Engineer & Developer',
    skills: JSON.stringify(['Python', 'PyTorch', 'TensorFlow', 'FastAPI']),
    interests: JSON.stringify(['Neural Networks', 'Automation', 'Robotics']),
    category: 'developer'
  },
  {
    name: 'Rohan Deshmukh',
    username: 'rohan_codes',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Frontend architecture & interactive web animations with Three.js & WebGL.',
    role: 'Frontend Developer',
    skills: JSON.stringify(['JavaScript', 'Three.js', 'WebGL', 'TailwindCSS']),
    interests: JSON.stringify(['Web Performance', 'Creative Coding', 'Design Systems']),
    category: 'developer'
  },
  {
    name: 'Kabir Varma',
    username: 'kabir_ios',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'iOS & macOS software engineer crafting fluid Apple ecosystem apps with Swift & SwiftUI.',
    role: 'Mobile App Developer',
    skills: JSON.stringify(['Swift', 'SwiftUI', 'CoreData', 'Combine']),
    interests: JSON.stringify(['Mobile UI', 'Audio Tech', 'Apple Silicon']),
    category: 'developer'
  },
  {
    name: 'Anika Sen',
    username: 'anika_backend',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Distributed systems & cloud infrastructure. Kafka, Postgres, Docker & Kubernetes.',
    role: 'Backend Systems Developer',
    skills: JSON.stringify(['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis']),
    interests: JSON.stringify(['Cloud Architecture', 'Security', 'Database Internals']),
    category: 'developer'
  },
  {
    name: 'Sameer Joshi',
    username: 'sameer_engine',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    bio: 'Game developer creating 3D mechanics & multiplayer backends in Unity & C#.',
    role: 'Game Developer',
    skills: JSON.stringify(['Unity', 'C#', 'Unreal Engine', '3D Math', 'Shaders']),
    interests: JSON.stringify(['Physics Engines', 'Game Design', 'Virtual Worlds']),
    category: 'developer'
  },

  // --- DESIGNERS ---
  {
    name: 'Advait Kulkarni',
    username: 'advait.design',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Product & Design Systems Lead. Crafting intuitive UX and pixel-perfect design in Figma.',
    role: 'UI/UX Product Designer',
    skills: JSON.stringify(['Figma', 'Design Systems', 'UX Research', 'Prototyping']),
    interests: JSON.stringify(['Micro-interactions', 'Typography', 'Spatial UI']),
    category: 'designer'
  },
  {
    name: 'Diya Shah',
    username: 'diyadraws',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'Brand identity & visual systems designer. Bringing brands to life through bold aesthetics.',
    role: 'Visual & Brand Designer',
    skills: JSON.stringify(['Illustrator', 'Photoshop', 'Brand Strategy', 'Logo Design']),
    interests: JSON.stringify(['Identity Systems', 'Poster Art', 'Color Psychology']),
    category: 'designer'
  },
  {
    name: 'Tanvi Roy',
    username: 'tanvi_motion',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    bio: 'Motion designer blending 3D visuals, kinetic typography, and interface motion.',
    role: 'Motion Graphics Designer',
    skills: JSON.stringify(['After Effects', 'Cinema 4D', 'Rive', 'Lottie', 'Blender']),
    interests: JSON.stringify(['3D Motion', 'Animation', 'UI Kinetics']),
    category: 'designer'
  },
  {
    name: 'Karan Mehra',
    username: 'karan_3d',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    bio: '3D Artist specializing in photorealistic product renders & game-ready environments.',
    role: '3D Designer & Artist',
    skills: JSON.stringify(['Blender', 'Substance Painter', 'ZBrush', 'Lighting']),
    interests: JSON.stringify(['Virtual Production', 'CGI', 'Automotive Renders']),
    category: 'designer'
  },

  // --- EDITORS ---
  {
    name: 'Rohan Verma',
    username: 'rohan.cuts',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    bio: 'Professional Video Editor for top creators and brands. Fast-paced retention storytelling.',
    role: 'Professional Video Editor',
    skills: JSON.stringify(['Premiere Pro', 'After Effects', 'Sound Design', 'Story Pacing']),
    interests: JSON.stringify(['Cinematic Pacing', 'Short-form Reels', 'VFX']),
    category: 'editor'
  },
  {
    name: 'Ved Prakash',
    username: 'editwithved',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bio: 'Cinematic colorist & post-production lead. Transforming raw camera footage into movie grades.',
    role: 'Cinematic Colorist & Editor',
    skills: JSON.stringify(['DaVinci Resolve', 'Color Grading', 'Film Emulation', 'ACES']),
    interests: JSON.stringify(['Color Science', 'Anamorphic Glass', 'Cinematography']),
    category: 'editor'
  },
  {
    name: 'Mehul Joshi',
    username: 'mehul_cuts',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6&w=400&auto=format&fit=crop&q=80',
    bio: 'VFX artist & dynamic transition specialist for high-energy commercials and social videos.',
    role: 'VFX & Motion Video Editor',
    skills: JSON.stringify(['After Effects', 'Rotoscoping', '3D Tracking', 'Sound FX']),
    interests: JSON.stringify(['Music Videos', 'Commercials', 'Soundscapes']),
    category: 'editor'
  },
  {
    name: 'Zoya Qureshi',
    username: 'zoya_sound',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Audio engineer & sound designer sculpting immersive spatial audio for films and podcasts.',
    role: 'Sound Designer & Editor',
    skills: JSON.stringify(['Pro Tools', 'Ableton Live', 'Foley', 'Dolby Atmos']),
    interests: JSON.stringify(['Spatial Audio', 'Score Composition', 'Foley Art']),
    category: 'editor'
  },

  // --- CREATORS ---
  {
    name: 'Tech Burner',
    username: 'imkhub',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    bio: 'Tech creator building crazy gadgets & entertaining storytelling for millions.',
    role: 'Tech Content Creator',
    skills: JSON.stringify(['On-camera Host', 'Gadget Teardown', 'Creative Concepts']),
    interests: JSON.stringify(['Consumer Tech', 'Design', 'Media Production']),
    category: 'creator'
  },
  {
    name: 'Tara Malhotra',
    username: 'tarafilms',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    bio: 'Cinematographer and visual director creating short films and high-concept mini-docs.',
    role: 'Cinematic Creator & Director',
    skills: JSON.stringify(['Directing', 'Cinematography', 'Lighting', 'Visual Storytelling']),
    interests: JSON.stringify(['Indie Cinema', 'Documentary', 'Visual Metaphors']),
    category: 'creator'
  },
  {
    name: 'Rivan Mehta',
    username: 'codewithrivan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Creator teaching 1M+ students how to build real-world AI apps and full-stack projects.',
    role: 'Tech & Coding Creator',
    skills: JSON.stringify(['Tech Tutorials', 'Live Coding', 'Community Leadership']),
    interests: JSON.stringify(['Developer Tools', 'AI Tools', 'Startups']),
    category: 'creator'
  },
  {
    name: 'Aanya Sen',
    username: 'aanyaframes',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'Street and editorial photographer capturing unfiltered human stories across India.',
    role: 'Visual Storytelling Creator',
    skills: JSON.stringify(['Editorial Photography', 'Portraits', 'Lightroom Master']),
    interests: JSON.stringify(['Culture', 'Street Style', 'Photojournalism']),
    category: 'creator'
  },

  // --- WRITERS ---
  {
    name: 'Kavya Desai',
    username: 'kavyawrites',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    bio: 'Screenplay writer & creative storyteller. Penning retention-driven YouTube scripts & ads.',
    role: 'Script Writer & Storyteller',
    skills: JSON.stringify(['Story Structure', 'Hook Writing', 'Screenplay', 'Copywriting']),
    interests: JSON.stringify(['Psychology', 'Narrative Design', 'Cinema']),
    category: 'writer'
  },
  {
    name: 'Nikhil Kashyap',
    username: 'nikhil_stories',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Investigative research & deep-dive video essays writer covering history, tech, and geopolitics.',
    role: 'Research & Video Essay Writer',
    skills: JSON.stringify(['Fact Checking', 'Long-form Essays', 'Script Formatting']),
    interests: JSON.stringify(['Geopolitics', 'Science', 'Narrative History']),
    category: 'writer'
  },

  // --- PRODUCERS ---
  {
    name: 'Vikram Sethi',
    username: 'vikram_producer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    bio: 'Executive Producer managing multi-city film shoots, talent hiring, and creative budgets.',
    role: 'Creative Media Producer',
    skills: JSON.stringify(['Production Logistics', 'Budgeting', 'Talent Scouting', 'Post Supervision']),
    interests: JSON.stringify(['Film Production', 'Ad Films', 'Creative Operations']),
    category: 'producer'
  },
  {
    name: 'Shalini Murthy',
    username: 'shalini_exec',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Podcast and live broadcast producer running high-profile celebrity and tech shows.',
    role: 'Show Producer & Director',
    skills: JSON.stringify(['Studio Setup', 'Guest Briefing', 'Broadcast Ops']),
    interests: JSON.stringify(['Audio Shows', 'Media Tech', 'Live Streaming']),
    category: 'producer'
  },

  // --- FOUNDERS & MARKETERS ---
  {
    name: 'Aarav Mehta',
    username: 'aaravbuilds',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    bio: 'Building early-stage consumer tech products. Passionate about community-led growth.',
    role: 'Startup Founder & Builder',
    skills: JSON.stringify(['Product Strategy', 'Pitching', 'Fundraising', '0 to 1']),
    interests: JSON.stringify(['SaaS', 'FinTech', 'Venture Capital']),
    category: 'founder'
  },
  {
    name: 'Pooja Iyer',
    username: 'pooja_growth',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Growth hacker & performance marketer scaling D2C brands & social platforms.',
    role: 'Growth Marketer & Strategist',
    skills: JSON.stringify(['SEO', 'Funnel Optimization', 'Ad Strategy', 'Analytics']),
    interests: JSON.stringify(['Viral Loops', 'Retention Engineering', 'Product Marketing']),
    category: 'marketer'
  }
];

async function seedRoles() {
  console.log('Seeding rich network role accounts...');

  for (const item of ROLES_DATA) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: item.username },
          { name: item.name }
        ]
      }
    });

    let userId = existing ? existing.id : null;

    if (!existing) {
      const cleanUname = item.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const created = await prisma.user.create({
        data: {
          name: item.name,
          username: item.username,
          email: `${cleanUname}@amerigam.com`,
          password: '$2b$10$epNz8rB9pD.2p2m0P9UoA.1Fp0w0L1uJv5/9H2OaT6lG8lS8jG5qK',
          avatarData: item.avatar,
          bio: item.bio,
          accountType: item.category === 'creator' ? 'CREATOR' : item.category === 'founder' ? 'BUSINESS' : 'PERSONAL',
          country: 'India',
          city: 'Mumbai',
          state: 'Maharashtra',
          amerigamPoints: Math.floor(Math.random() * 2000) + 400
        }
      });
      userId = created.id;
      console.log(`Created new user: ${item.name} (${item.username})`);
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          avatarData: item.avatar,
          bio: item.bio,
          name: item.name
        }
      });
      console.log(`Updated user: ${item.name}`);
    }

    // Upsert PersonalProfile
    await prisma.personalProfile.upsert({
      where: { userId },
      create: {
        userId,
        mainIdentity: item.role,
        skills: item.skills,
        interests: item.interests,
        hobbies: JSON.stringify(['Reading', 'Networking', 'Learning'])
      },
      update: {
        mainIdentity: item.role,
        skills: item.skills,
        interests: item.interests
      }
    });

    // If creator, also upsert CreatorProfile
    if (item.category === 'creator' || item.category === 'editor') {
      await prisma.creatorProfile.upsert({
        where: { userId },
        create: {
          userId,
          creatorType: item.role,
          niche: item.role
        },
        update: {
          creatorType: item.role,
          niche: item.role
        }
      });
    }
  }

  console.log('✅ Successfully seeded and enriched network users across all fields!');
  process.exit(0);
}

seedRoles().catch(err => {
  console.error(err);
  process.exit(1);
});
