import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AxionBio',
  description:
    'AxionBio is the definitive full-stack B2B SaaS for AI-driven drug discovery. From multi-omics target identification to generative protein design, deep molecular simulation, and automated physical lab synthesis.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: [
    'drug discovery',
    'protein design',
    'AI biopharma',
    'molecular dynamics',
    'generative biology',
    'enterprise biotech',
    'PROTAC',
    'CRISPR engineering',
  ],
  openGraph: {
    title: 'AxionBio',
    description:
      'Orchestrate the entire drug discovery lifecycle with AI-powered agentic workflows, deep molecular simulation, and automated lab synthesis.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AxionBio',
    description:
      'Orchestrate the entire drug discovery lifecycle with AI-powered agentic workflows.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
