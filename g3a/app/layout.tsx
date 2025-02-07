import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "G3A - the best key reseller",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-gray-800 text-white p-6 flex items-center space-x-4">
          <img
          src="/g3a.se.jpg" 
          alt="Site Logo"
          className="w-12 h-12 rounded-full"
          />
        <h1 className="text-2xl font-bold"> G3A.se </h1>
      </header>
      
        {children}
      </body>
    </html>
  );
}
