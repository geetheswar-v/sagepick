import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/header"
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body
        className={`${josefin.variable} ${poppins.variable} relative font-poppins antialiased`}
      >
        <Header />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}