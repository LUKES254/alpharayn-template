import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Analytics } from '@vercel/analytics/next';
 


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ideacloner - The SaaS Boilerplate for African Developers",
  description: "Launch your SaaS in days, not months. The complete Next.js boilerplate with Paystack, Supabase, and BetterAuth.",
  keywords: "saas boilerplate, nextjs starter, african saas, paystack integration, supabase, betterauth",
  authors: [{ name: "ideacloner Team" }],
  openGraph: {
    title: "ideacloner - The SaaS Boilerplate for African Developers",
    description: "Launch your SaaS in days, not months. The complete Next.js boilerplate with Paystack, Supabase, and BetterAuth.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ideacloner - The SaaS Boilerplate for African Developers",
    description: "Launch your SaaS in days, not months.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
