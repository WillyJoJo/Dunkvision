import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 1) Si no hay token, el usuario no está logueado
    if (!token) {
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 2) Requiere rol admin si:
    const esRutaAdmin =
      pathname.startsWith("/dashboard") ||
      pathname.match(/^\/jugadores\/\d+\/nuevalesion$/) ||
      pathname.match(/^\/lesiones\/editar\/\d+$/);

    if (esRutaAdmin && token.rol !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Si llega aquí, puede acceder a la ruta
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

// Rutas a las que se aplicará este middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/equipos/:path*",
    "/jugadores/:path*",
    "/lesiones/:path*",
    "/enfrentamiento/:path*",
  ],
};
