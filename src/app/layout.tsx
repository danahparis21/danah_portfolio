import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mica Danah Paris | Software Engineer & Applied AI Developer",
  description:
    "Interactive macOS/iOS portfolio of Mica Danah Paris. BSIT student at Batangas State University ARASOF. Featuring SEÑAS (AI-powered Filipino Sign Language platform), 3D ID Badge, Butter Days Bakery, and collaborative Secret Garden.",
  keywords: [
    "Mica Danah Paris",
    "Danah Paris",
    "Software Engineer",
    "Applied AI",
    "SEÑAS",
    "Filipino Sign Language",
    "MediaPipe",
    "React Native",
    "Expo",
    "Batangas State University",
  ],
  authors: [{ name: "Mica Danah Paris" }],
  openGraph: {
    title: "Mica Danah Paris | Software Engineer & Applied AI",
    description: "Explore my interactive macOS portfolio, flagship AI project SEÑAS, and interactive creative studio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-pink-200 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}

