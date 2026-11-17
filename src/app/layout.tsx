import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Archives·Bénin | Plateforme de recherche et de consultation archivistique",
  description: "Plateforme numérique nationale de recherche et de consultation des ressources archivistiques du Bénin. Catalogue en ligne, recherche avancée, statistiques et fiches détaillées.",
  keywords: ["archives", "Bénin", "recherche archivistique", "catalogue", "patrimoine", "histoire", "documentation"],
  authors: [{ name: "Archives·Bénin" }],
  openGraph: {
    title: "Archives·Bénin",
    description: "Plateforme de recherche et de consultation des archives du Bénin",
    type: "website",
    locale: "fr_BJ",
    siteName: "Archives·Bénin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/img/log.png" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome 6.5.1 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <Navbar />
        <main id="main-content" className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}