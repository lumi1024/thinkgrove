import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Knowledge Forest',
  description: 'Knowledge Forest — 协作知识森林',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
