import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/productos/:path*",
    "/categorias/:path*",
    "/pedidos/:path*",
    "/clientes/:path*",
    "/usuarios/:path*",
    "/inventario/:path*",
    "/reportes/:path*",
    "/carritos-abandonados/:path*",
    "/configuracion/:path*",
    "/cupones/:path*",
    "/facturacion/:path*",
    "/newsletter/:path*",
    "/respaldos/:path*",
    "/importar-exportar/:path*",
    "/actividad/:path*",
    "/login"
  ],
};
