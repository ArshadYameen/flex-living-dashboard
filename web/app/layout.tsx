// web/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers"; // Import our data provider
import { ThemeProvider } from "@/components/theme-provider"; // Import shadcn's theme provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flex Living Dashboard",
  description: "Manage your property reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Wrap your entire app in the providers */}
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}