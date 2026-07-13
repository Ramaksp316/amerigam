import './globals.css';
import { Metadata } from 'next';
import { Oswald } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';
import Sidebar from './components/Sidebar';
import { cookies } from 'next/headers';
import { prisma } from '../lib/prisma';

const oswald = Oswald({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
});

export const viewport = {
  themeColor: '#000000',
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
  if (userId) {
    unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  return (
    <html lang="en">
      <body className={oswald.className}>
        <ThemeProvider>
          <div className="app-layout">
            <Sidebar unreadCount={unreadCount} />
            <main className="main-content">
              {children}
            </main>
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
