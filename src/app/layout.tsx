import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Studio",
  description: "YouTube Studio",
  icons: {
    icon: "https://www.youtube.com/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#0f0f0f] text-white antialiased">{children}</body>
    </html>
  );
}
