"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }: { data: { x: string; y: number | null }[] }) {
  if (data.length === 0) return <p className="mt-3 text-sm text-muted-foreground">Pas encore de données.</p>;
  return (
    <div className="mt-3 h-36">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -24, right: 4, top: 4, bottom: 0 }}>
          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8ff3d" stopOpacity={0.35} /><stop offset="100%" stopColor="#c8ff3d" stopOpacity={0} /></linearGradient></defs>
          <XAxis dataKey="x" tick={{ fill: "#8b919c", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={{ fill: "#8b919c", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "#14161a", border: "1px solid #262a31", borderRadius: 12 }} />
          <Area type="monotone" dataKey="y" stroke="#c8ff3d" strokeWidth={2} fill="url(#g)" connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
