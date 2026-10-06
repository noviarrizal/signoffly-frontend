import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { t } from "@/lib/messages";
import { siteUrl } from "@/lib/site";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// A function, not a constant, so SITE_URL is read when the server runs rather than when it is built.
export async function generateMetadata(): Promise<Metadata> {
  const description = t("meta.description");
  return {
    metadataBase: siteUrl(),
    title: { default: t("meta.title"), template: "%s | Signoffly" },
    description,
    applicationName: t("brand"),
    openGraph: { type: "website", siteName: t("brand"), title: t("meta.title"), description, locale: "en_US" },
    twitter: { card: "summary_large_image", title: t("meta.title"), description },
  };
}

// Runs before the first paint so the saved theme never flashes. Light is the default;
// the OS theme is never followed. Storage can be unavailable, so everything is guarded.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrument.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}