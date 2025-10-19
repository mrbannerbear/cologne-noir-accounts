import './globals.css';
import { ReactQueryClientProvider } from './providers/react-query-provider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Perfume Account Tracker',
  description: 'Track customers and orders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryClientProvider>
          {children}</ReactQueryClientProvider>
      </body>
    </html>
  );
}
