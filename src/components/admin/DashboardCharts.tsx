"use client";

import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface SalesChartProps {
  data: { date: string; sales: number; orders: number }[];
}

/**
 * P1/P4: Extracted charts to a client component to keep the dashboard page as RSC.
 * This also helps with Recharts hydration issues.
 */
export function SalesChart({ data }: SalesChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--surface-container-low)] rounded-lg">
        <p className="text-[var(--outline)] flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> No hay datos de ventas recientes
        </p>
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 w-full animate-pulse bg-[var(--surface-container-low)] rounded-lg" />;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: "var(--outline)" }} 
            stroke="var(--outline)" 
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "var(--outline)" }} 
            stroke="var(--outline)" 
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ventas"]}
            contentStyle={{ 
              backgroundColor: 'var(--surface)', 
              borderRadius: '8px', 
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)'
            }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ComparisonBarProps {
  currentValue: number;
  previousValue: number;
  label: string;
  format?: "currency" | "number";
  colorClass: string;
}

export function ComparisonBar({ currentValue, previousValue, label, format = "currency", colorClass }: ComparisonBarProps) {
  const percentage = previousValue > 0 
    ? (previousValue / (currentValue || 1)) * 100 
    : 0;

  const displayCurrent = format === "currency" ? `$${currentValue.toFixed(2)}` : currentValue;
  const displayPrevious = format === "currency" ? `$${previousValue.toFixed(2)}` : previousValue;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--on-surface-variant)]">Mes actual</span>
        <span className="font-medium">{displayCurrent}</span>
      </div>
      <div className="w-full bg-[var(--surface-container-high)] rounded-full h-2">
        <div className={`${colorClass} h-2 rounded-full`} style={{ width: '100%' }} />
      </div>
      <div className="flex justify-between text-xs mt-2">
        <span className="text-[var(--on-surface-variant)]">Mes anterior</span>
        <span className="font-medium">{displayPrevious}</span>
      </div>
      <div className="w-full bg-[var(--surface-container-high)] rounded-full h-2">
        <div
          className="bg-[var(--outline)] h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
