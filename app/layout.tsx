// SPDX-License-Identifier: MIT

import type {Metadata} from 'next';
import './globals.css'; // Global styles
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
      <body suppressHydrationWarning className="pt-12">
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
