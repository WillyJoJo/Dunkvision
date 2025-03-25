import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Exporta UN SOLO middleware por defecto
export default withAuth(
  // Esta función se ejecuta en cada request a las rutas definidas en `matcher`.
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 1) Si no hay token, el usuario no está logueado
    if (!token) {
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 2) Si la ruta comienza con "/dashboard", requerimos rol "admin"
    if (pathname.startsWith("/dashboard") && token.rol !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Si llega aquí, puede acceder a la ruta
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Este callback se ejecuta ANTES de `middleware()`.
       * Por defecto, if you return true, significa que cualquiera puede entrar.
       * Aquí, con la lógica en `middleware()`, basta con devolver true para que
       * NextAuth no bloquee nada antes de tiempo.
       */
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
  ],
};
