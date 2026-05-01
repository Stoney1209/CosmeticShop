import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;
  if (!userRole || (userRole !== "ADMIN" && userRole !== "OPERATOR")) {
    throw new Error("Forbidden: Admin access required");
  }

  return session;
}
