import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { DoodleBackground } from "@/components/DoodleBackground";
import { ChatWidget } from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "PhonicsFlow — Master Your Phonics",
  description: "A modern phonics learning platform for students and teachers. Practice phonics, track progress, and improve your speaking skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DoodleBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
