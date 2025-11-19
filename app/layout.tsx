import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archmind | Software Engineering Workbench",
  description:
    "Generate AI-assisted solution architectures, rationale, and diagram descriptions powered by Gemini.",
  icons: {
    icon: [{ url: "/iconArchMind.png", type: "image/png", sizes: "any" }],
    shortcut: "/iconArchMind.png",
    apple: "/iconArchMind.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
