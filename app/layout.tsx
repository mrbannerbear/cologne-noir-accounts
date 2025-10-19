import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";
import Sidebar from "./_components/Sidebar";
import "./globals.css";
import { ReactQueryClientProvider } from "./providers/react-query-provider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Perfume Account Tracker",
  description: "Track customers and orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryClientProvider>
          <Sidebar />
          {/* Main content area with left margin for sidebar */}
          <div className="lg:ml-[280px]">
            {/* <Header /> */}
            {/* Main content */}
            <main>{children}</main>
            {/* <Footer /> */}
          </div>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
