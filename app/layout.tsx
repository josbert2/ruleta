import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Titan_One, Rubik, Paytone_One } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruleta de Premios | ¡Gira y Gana!",
  description: "¡Prueba tu suerte y gana premios exclusivos!",
    generator: 'v0.app',
  icons: {
    icon: 'https://tickets.funpark.cl/images/cache/thumb_260_130/proveedorlogo/6554d4be720e1981968092.png',
  },
}

const titanOne = Titan_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-titan',
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

const paytoneOne = Paytone_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-paytone",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${titanOne.variable} ${rubik.variable} ${paytoneOne.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
