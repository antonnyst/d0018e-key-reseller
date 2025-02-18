import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./header";
import { cookies } from "next/headers";

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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = "";

  const cookieStore = await cookies();
  if (cookieStore.has("g3a-session")) {
    const sessionToken = cookieStore.get("g3a-session");
    if (sessionToken !== undefined) {
      session = sessionToken.value;
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header session={session}></Header>

        {children}
      </body>
    </html>
  );
}

