import './globals.css';
import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import Script from 'next/script';

const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rimba',
  description: 'Compliance and Audit AI for industrial operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="hotjar-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function (c, s, q, u, a, r, e) {
                    c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
                    c._hjSettings = { hjid: a };
                    r = s.getElementsByTagName('head')[0];
                    e = s.createElement('script');
                    e.async = true;
                    e.src = q + c._hjSettings.hjid + u;
                    r.appendChild(e);
                })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', 5321422);
              `,
            }}
          />
        )}
        {children}
      </body>
    </html>
  );
}