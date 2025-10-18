import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import { Josefin_Sans, Poppins } from "next/font/google";
import "@/app/globals.css";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SagePick - Discover Movies & TV Shows",
  description: "Discover trending movies, popular TV shows, and the latest releases.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className="dark">
      <body
        className={`${josefin.variable} ${poppins.variable} relative font-poppins antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}