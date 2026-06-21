// SPDX-License-Identifier: MIT

import type {Metadata} from 'next';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavWithIdentity } from '@/components/NavWithIdentity';
import { ToastProvider } from '@/components/ui/Toast';
import { ScrollRestoration } from '@/components/ScrollRestoration';

export const metadata: Metadata = {
  title: 'ThinkGrove',
  description: 'ThinkGrove — 协作思想丛林',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="pt-14">
        <ToastProvider>
          <ScrollRestoration />
          <NavWithIdentity />
          {children}
        </ToastProvider>
        <ThemeToggle />
      </body>
    </html>
  );
}
