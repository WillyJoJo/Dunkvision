import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "@/components/ui/NavBar";
import { ReactQueryProvider } from "@/context/ReactQueryProvider"; // Ajusta la ruta según tu estructura
import SessionAuthProvider from "@/context/SessionAuthProvider";

const items = [
  { label: "Inicio", href: "/" },
  { label: "Equipos", href: "/equipos" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Lesiones", href: "/lesiones" },
];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DUNKVISION",
  description: "Aplicación de baloncesto NBA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionAuthProvider>
        <ReactQueryProvider>
          <header className="header" />
          <div className="main-container">
            <NavBar items={items} />
            <main className="main-content">{children}</main>
          </div>
          <footer className="footer">
            Hecho por Guillermo Pichaco Panal 👑🏀
          </footer>
        </ReactQueryProvider>
        </SessionAuthProvider>
      </body>
    </html>
  );
}
