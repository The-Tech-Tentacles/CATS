/**
 * Root Layout Component
 * Provides global providers, styles, and metadata
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CATS - Cyber Crime Tracking System',
    template: '%s | CATS',
  },
  description: 'District-level Cyber Crime Complaint and Application Tracking System',
  keywords: [
    'cyber crime',
    'complaint tracking',
    'police',
    'government',
    'digital india',
    'e-governance',
  ],
  authors: [
    {
      name: 'Cyber Crime Investigation Department',
    },
  ],
  creator: 'Government of India',
  publisher: 'Cyber Crime Investigation Department',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    title: 'CATS - Cyber Crime Tracking System',
    description: 'District-level Cyber Crime Complaint and Application Tracking System',
    siteName: 'CATS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CATS - Cyber Crime Tracking System',
    description: 'District-level Cyber Crime Complaint and Application Tracking System',
    creator: '@CyberCrimeBranch',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'government',
  classification: 'Government Service',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CATS',
    'application-name': 'CATS',
    'msapplication-TileColor': '#001F3F',
    'theme-color': '#001F3F',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Government branding */}
        <meta name="government" content="true" />
        <meta name="department" content="Cyber Crime Investigation Department" />
        <meta name="classification" content="Government Service" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}