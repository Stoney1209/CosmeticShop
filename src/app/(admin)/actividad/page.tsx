import { Card, CardContent } from "@/components/ui/card";
import { getActivityLogs } from "@/app/actions/activity";
import { ActivityClient } from "./ActivityClient";

export const metadata = { title: "Actividad | Admin" };

export default async function ActivityPage() {
  const logs = await getActivityLogs(200);
  // Serialize dates for client components
  const serializedLogs = logs.map((log: any) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Actividad</h2>
        <p className="text-slate-500">Registro de actividades en el sistema.</p>
      </div>
      <Card><CardContent className="p-0"><ActivityClient initialLogs={serializedLogs} /></CardContent></Card>
    </div>
  );
}
