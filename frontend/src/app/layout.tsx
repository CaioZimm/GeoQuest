import "./globals.css";

import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoQuest | O Desafio Diário de Geografia",
  description: "Descubra o país misterioso do dia usando o menor número possível de pistas. Teste seus conhecimentos geográficos!",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "GeoQuest | O Desafio Diário de Geografia",
    description: "Descubra o país misterioso do dia usando o menor número possível de pistas. Jogue agora!",
    url: "#",
    siteName: "GeoQuest",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoQuest | O Desafio Diário de Geografia",
    description: "Teste seus conhecimentos de geografia descobrindo o país do dia!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased text-slate-50 min-h-screen selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}
