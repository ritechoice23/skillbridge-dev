import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { InlineScript } from "@/components/inline-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_DESCRIPTION =
  "Discover mentors for practical skills and send a mentorship request.";

export const metadata: Metadata = {
  title: {
    default: "SkillBridge — Find a mentor for practical skills",
    template: "%s | SkillBridge",
  },
  description: APP_DESCRIPTION,
  applicationName: "SkillBridge",
  openGraph: {
    title: "SkillBridge — Find a mentor for practical skills",
    description: APP_DESCRIPTION,
    type: "website",
    siteName: "SkillBridge",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InlineScript
          html={`try{var m=matchMedia("(prefers-color-scheme: dark)");document.documentElement.classList.toggle("dark",m.matches)}catch(e){}`}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
