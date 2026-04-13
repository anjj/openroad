import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const titillium = Titillium_Web({ 
  subsets: ["latin"], 
  weight: ["200", "300", "400", "600", "700", "900"],
  variable: "--font-titillium" 
});

export const metadata: Metadata = {
  title: "openRoad",
  description: "Minimalist GitHub Roadmap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${titillium.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
