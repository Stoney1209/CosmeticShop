"use client";

import { Truck, Clock, PackageCheck } from "lucide-react";

interface DeliveryInfoProps {
  inStock: boolean;
}

export function DeliveryInfo({ inStock }: DeliveryInfoProps) {
  if (!inStock) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <Clock className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-900">Temporalmente fuera de stock</p>
          <p className="text-sm text-red-700">Notificaremos cuando esté disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Express delivery */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Truck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-medium text-emerald-900">Recibe en 24-48 horas</p>
          <p className="text-sm text-emerald-700">Envío express disponible</p>
        </div>
      </div>
      
      {/* Additional info */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <PackageCheck className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">Stock disponible</p>
          <p className="text-sm text-slate-600">Listo para enviar</p>
        </div>
      </div>
    </div>
  );
}
