import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-playfair" });

export const metadata = {
  title: "Lumina | Fine Dining Experience",
  description: "Scan, order, and pay seamlessly from your table.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} ${playfair.variable}`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
