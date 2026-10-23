import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Software Development · Illumia Solutions",
    template: "%s · Illumia Software",
  },
  description:
    "Illumia Solutions designs and builds web, mobile, ERP and AI software, secured by design and supported across six time zones.",
  icons: { icon: "/brand/illumia-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1f1f25",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
