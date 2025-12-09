import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/providers/music-provider";
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar";
import { GlobalBackground } from "@/components/global-background";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultimate Task Tracker",
  description: "Your personal productivity hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased flex min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground overflow-hidden font-sans relative transition-colors duration-1000`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MusicProvider>
            <GlobalBackground />
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
              {children}
            </div>
          </MusicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
