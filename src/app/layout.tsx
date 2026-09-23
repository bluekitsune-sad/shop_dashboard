import type { Metadata } from "next";
import "@fontsource-variable/open-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Shop Dashboard",
    template: "%s · Shop Dashboard",
  },
  description: "Inventory management for phones, accessories, and perfumes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
