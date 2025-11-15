import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino Wheel Game",
  description: "Play for amazing prizes on our casino wheel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
