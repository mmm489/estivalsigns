import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Revenue Signals · Calendario de demanda externa",
  description: "Demostración anonimizada para anticipar la demanda hotelera con señales públicas y externas.",
  openGraph: { title: "Revenue Signals", description: "Calendario de demanda externa · demo anonimizada", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Revenue Signals", description: "Calendario de demanda externa · demo anonimizada", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
