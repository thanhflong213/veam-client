import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEAM – Vietnam Economists Annual Meeting",
  description:
    "Vietnam Economists Annual Meeting – annual conference for economists and social researchers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
