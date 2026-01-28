import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Online Judge",
  description: "Platform for coding problems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Online Judge. Все права защищены.
              </div>
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
