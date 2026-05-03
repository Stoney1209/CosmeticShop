import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import dynamic from "next/dynamic";

const DashboardContent = dynamic(
  () => import("./DashboardContent").then((mod) => mod.DashboardContent),
  { ssr: false, fallback: <DashboardSkeleton /> }
);

// P2: Server Component - data fetching happens on server with streaming
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardAsync />
    </Suspense>
  );
}

// Async component for data fetching
async function DashboardAsync() {
  const data = await getDashboardData();
  return <DashboardContent data={data} />;
}
