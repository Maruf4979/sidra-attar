import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "Sidra Attar Wala — Artisanal Pure Attars & Perfumery",
  description:
    "Crafting the finest artisanal fragrances since generations. Explore our curated collection of pure attars, oud essences, and luxury perfume oils. Free shipping on orders above ₹999.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
