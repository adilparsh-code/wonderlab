import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "WonderLab — Don't Just Learn It. Explore It.",
    template: "%s | WonderLab",
  },
  description:
    "Free browser games, science explorations, and beginner coding challenges for curious learners aged 11–16.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
