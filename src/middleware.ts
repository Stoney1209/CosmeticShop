import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
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
    "/admin/dashboard/:path*",
    "/admin/productos/:path*",
    "/admin/categorias/:path*",
    "/admin/pedidos/:path*",
    "/admin/clientes/:path*",
    "/admin/usuarios/:path*",
    "/admin/inventario/:path*",
    "/admin/reportes/:path*",
    "/admin/carritos-abandonados/:path*",
    "/admin/configuracion/:path*",
    "/admin/cupones/:path*",
    "/admin/facturacion/:path*",
    "/admin/newsletter/:path*",
    "/admin/respaldos/:path*",
    "/admin/importar-exportar/:path*",
    "/admin/actividad/:path*",
    "/login"
  ],
};
