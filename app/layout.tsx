import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ishaan Shaffir - Full-Stack Developer",
  description:
    "Computer Science student at UBC Okanagan focused on building practical web applications. Full-stack developer interested in AI/ML, game dev, and HCI.",
  keywords: [
    "Ishaan Shaffir",
    "Full-Stack Developer",
    "Computer Science",
    "UBC Okanagan",
    "Portfolio",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
