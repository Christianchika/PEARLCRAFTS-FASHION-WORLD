import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEARLCRAFTS FASHION WORLD",
  description:
    "Beautifully crafted fascinators, headpieces and hair accessories for women.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}