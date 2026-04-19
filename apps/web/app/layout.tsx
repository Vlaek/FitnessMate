import { Toaster } from '@repo/ui/components/sonner';
import '@repo/ui/globals.css';
import './theme-overrides.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppFooter } from './components/app-footer';
import I18nProvider from './providers/i18n-provider';
import ThemeProvider from './providers/theme-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'FitnessMate',
  description: 'Track your workouts and share results via Telegram',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors`}>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <AppFooter />
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
