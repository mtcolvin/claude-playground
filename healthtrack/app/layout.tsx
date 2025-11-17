import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthTrack AI - Your Personal Health Companion",
  description: "AI-powered health tracking and insights platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-gray-900">
        {children}
      </body>
    </html>
  );
}
