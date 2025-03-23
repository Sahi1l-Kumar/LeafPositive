import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { ReactNode } from "react";
import { dir } from "i18next";

import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/context/Theme";

const inter = localFont({
  src: "./fonts/InterVF.ttf",
  variable: "--font-inter",
  weight: "100 200 300 400 500 700 800 900",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
  weight: "300 400 500 700",
});

export const metadata: Metadata = {
  title: "Plant Pulse",
  description:
    "An app that checks the pulse of your plants, detecting health issues and guiding you towards effective treatments.",
  icons: {
    icon: "/images/site-logo.svg",
  },
};

const RootLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: { lng?: string };
}) => {
  const session = await auth();
  const lng = params.lng || "en";

  return (
    <html lang={lng} dir={lng ? dir(lng) : undefined} suppressHydrationWarning>
      <head></head>
      <body
        className={`${inter.className} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
