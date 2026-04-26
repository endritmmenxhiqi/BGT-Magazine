import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});

export const metadata = {
  title: "BGT - Gazeta Online | Lajmi i Fundit",
  description: "Portali juaj kryesor për lajme, ekonomi, sport dhe teknologji.",
};

import { Suspense } from 'react';

export default function RootLayout({ children }) {
  return (
    <html lang="sq" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo-bgt.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-[#0f172a] dark:bg-[#020617] dark:text-gray-100 transition-colors duration-300`}>
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-black uppercase animate-pulse">BGT</div>}>
          {children}
        </Suspense>
        
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: #0f172a;
            --accent: #ca8a04;
            --bg-body: #ffffff;
            --border-ui: #e2e8f0;
            --navbar-h: 80px;
          }

          .dark {
            --primary: #ffffff;
            --accent: #fbbf24;
            --bg-body: #020617;
            --border-ui: #1e293b;
          }

          .serif { font-family: var(--font-playfair), serif; }
          .sans { font-family: var(--font-inter), sans-serif; }

          /* Premium News System (Telegrafi Layout) */
          * { border-color: var(--border-ui); }
          
          /* Remove bubbly/glow effects */
          .glass, .blur-bg, .bubble-shadow {
            backdrop-filter: none !important;
            background: none !important;
            box-shadow: none !important;
          }

          h1, h2, h3, h4 { letter-spacing: -0.02em; }
          
          ::selection {
            background: var(--accent);
            color: #fff;
          }
        `}} />
      </body>
    </html>
  );
}