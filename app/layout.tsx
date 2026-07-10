import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expenses Tracker",
  description: "Track spending, budgets, and savings goals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
