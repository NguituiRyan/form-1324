import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://form-1324.vercel.app"),
  title: "FORM / 1324 — Build a body that works",
  description:
    "Visual, practical workout plans and a custom training plan builder powered by 1,324 exercises.",
  openGraph: {
    title: "FORM / 1324",
    description: "Choose a proven plan or build your own. Train with intent.",
    type: "website",
    images: [{ url: "/og.png", width: 1732, height: 909, alt: "FORM / 1324 — Build a body that works." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORM / 1324",
    description: "Choose a proven plan or build your own. Train with intent.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
