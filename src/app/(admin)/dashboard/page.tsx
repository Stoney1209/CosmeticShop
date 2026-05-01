import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardContent } from "./DashboardContent";
import { DashboardSkeleton } from "./DashboardSkeleton";

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
