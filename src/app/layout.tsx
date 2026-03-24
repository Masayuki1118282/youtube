import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Studio",
  description: "YouTube Studio",
  icons: { icon: "https://www.youtube.com/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0f0f0f] text-white antialiased" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
