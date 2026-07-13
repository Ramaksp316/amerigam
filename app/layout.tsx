import './globals.css';
import { Oswald } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';
import Sidebar from './components/Sidebar';

const oswald = Oswald({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
});

export const metadata = {
  title: 'AMERIGAM',
  description: 'Connect, Create & Share',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={oswald.className}>
        <ThemeProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
