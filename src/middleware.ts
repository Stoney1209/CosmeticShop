import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Check if user has admin or operator role
      const userRole = token?.role;
      if (!userRole || (userRole !== "ADMIN" && userRole !== "OPERATOR")) {
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

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
