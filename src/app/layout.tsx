import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/components/auth-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

// Type from the Figma design: Playfair Display for headings, Inter for text.
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Note by Note — Free online music lessons',
    template: '%s · Note by Note',
  },
  description:
    'Free online music lessons from student volunteers. Learn an instrument, or share what you know as a mentor.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper">
        <AuthProvider>
          <a
            href="#main"
            className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-navy"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
