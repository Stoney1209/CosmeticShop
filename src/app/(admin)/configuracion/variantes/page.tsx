import { prisma } from "@/lib/prisma";
import { VariantsClient } from "./VariantsClient";

export default async function VariantsPage() {
  const variantTypes = await prisma.variantType.findMany({
    include: { values: true },
    orderBy: { name: "asc" }
  });

  return <VariantsClient initialData={variantTypes} />;
}
