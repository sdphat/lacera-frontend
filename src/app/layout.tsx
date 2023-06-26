import { Metadata } from 'next';
import './globals.css';
import { Inter, Roboto, Montserrat, Open_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-roboto' });

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-montserrat',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'Lacera',
  description: 'Lacera - Connect people around the world',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${roboto.variable} ${montserrat.variable} ${openSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
