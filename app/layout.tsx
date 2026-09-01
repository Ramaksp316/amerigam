import './globals.css';
import { Metadata } from 'next';
import { Inter, Caveat } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';
import Sidebar from './components/Sidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ActiveStatusTracker from './components/ActiveStatusTracker';
import MobileBottomNav from './components/MobileBottomNav';
import MobileDrawer from './components/MobileDrawer';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const viewport = {
  themeColor: '#0B0C10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Amerigam - Connect, Create, Share",
  description: "A platform for creators, professionals, athletes, and explorers.",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  let unreadCount = 0;
  let currentUser = null;
  let joinedCommunities: any[] = [];
  let networkUsers: any[] = [];
  
  if (userId) {
    unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, avatarData: true, status: true, lastSeen: true, accountType: true }
    });

    if (currentUser?.accountType === 'PERSONAL') {
      joinedCommunities = await prisma.communityMember.findMany({
        where: { userId },
        include: { community: true },
        orderBy: { joinedAt: 'desc' },
        take: 5
      });
      networkUsers = await prisma.follow.findMany({
        where: { followerId: userId, following: { accountType: 'PERSONAL' } },
        include: { following: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${caveat.variable}`}>
        <ThemeProvider>
          <ActiveStatusTracker userId={userId} />
          <div className="mobile-only">
            <MobileDrawer currentUser={currentUser} joinedCommunities={joinedCommunities} networkUsers={networkUsers} />
          </div>
          <div className="app-layout">
            <Sidebar unreadCount={unreadCount} currentUser={currentUser} joinedCommunities={joinedCommunities} networkUsers={networkUsers} />

            <main className="main-content">
              {children}
            </main>
            <MobileBottomNav currentUser={currentUser} />
            <PWAInstallPrompt />
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    }, function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  });
                }
              `,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
