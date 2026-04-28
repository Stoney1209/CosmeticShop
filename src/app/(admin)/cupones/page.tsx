import { prisma } from "@/lib/prisma";
import { CouponsClient } from "./CouponsClient";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <CouponsClient initialCoupons={JSON.parse(JSON.stringify(coupons))} />;
}
