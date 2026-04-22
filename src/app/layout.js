import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "PaperMind - Academic Assistant",
  description:
    "Your intelligent academic paper analysis assistant. Upload research papers, get instant summaries, and ask deep questions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="h-screen overflow-hidden antialiased">{children}</body>
    </html>
  );
}
