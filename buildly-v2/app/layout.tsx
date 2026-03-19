import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buildly V2",
  description: "Validate startup ideas before building and move into MVP generation with confidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
