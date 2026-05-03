import { Skeleton } from "@/components/ui/skeleton";

export default function TiendaLoading() {
  return (
    <div className="bg-[var(--surface)] min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mb-12 lg:mb-16 max-w-2xl">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30">
                <Skeleton className="h-6 w-1/2 mb-5" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </aside>

          <div className="flex-1 w-full">
            <div className="mb-6 flex justify-between items-center bg-[var(--surface-container-lowest)] p-4 rounded-xl border border-[var(--outline-variant)]/30">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[var(--surface-container-lowest)] rounded-xl overflow-hidden shadow-sm border border-[var(--outline-variant)]/10">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-5 w-full" />
                    <div className="pt-4 border-t border-[var(--outline-variant)]/20 flex justify-between items-center">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
