import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
        <header className="bg-gray-800 text-white p-6 flex items-center ">
          <div className="flex items-center space-x-4">
            <Link href={"/"} className="flex items-center space-x-4">
              <img
                src="/g3a.se.jpg"
                alt="Site Logo"
                className="w-12 h-12 rounded-full space-x-4"
              />
              <h1 className="text-2xl font-bold"> G3A.se </h1>
            </Link>
          </div>

          <div className="ml-auto flex items-center">
            <Link href="/user" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 hover:opacity-80 transition-opacity"
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-12 h-12 rounded-full"
                src="/pp.jpg"
                alt="user photo"
              />
            </Link>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}

