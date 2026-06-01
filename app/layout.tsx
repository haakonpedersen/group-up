import type { Metadata } from "next";
import "./globals.css"; // Imports your Tailwind styles

export const metadata: Metadata = {
  title: "Group Planner",
  description: "Plan events with friends smoothly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}