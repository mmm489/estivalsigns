import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Estival Signals · Calendario de demanda externa",
  description: "Señales públicas y externas para anticipar la demanda en La Pineda.",
  openGraph: { title: "Estival Signals", description: "Calendario de demanda externa", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Estival Signals", description: "Calendario de demanda externa", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
