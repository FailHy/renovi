"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// TIDAK perlu import 'next-themes', agar lebih sederhana

interface ChartData {
  name: string;
  // Ini adalah dataKey yang diharapkan, 'progress'
  progress: number; 
}

interface ProjectProgressChartProps {
  data: ChartData[];
}

// Komponen Tooltip Kustom (UI lebih baik)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-lg shadow-sm">
        <p className="font-bold text-card-foreground">{label}</p>
        <p className="text-sm text-primary">
          {/* Menggunakan 'Total' agar konsisten dengan dataKey */}
          {`Total: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

// Fungsi untuk memotong teks
const formatTick = (tick: string) => {
  if (tick.length > 20) {
    return tick.substring(0, 20) + "...";
  }
  return tick;
};

export default function ProjectProgressChart({ data }: ProjectProgressChartProps) {
  
  // Menggunakan warna statis dari tema Anda yang aman 
  // untuk light/dark mode
  const tickColor = "#9CA3AF"; // --muted-foreground (dark)
  const barColor = "#3B82F6";  // --primary (dark)
  const barHoverColor = "#60A5FA";

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke={tickColor}
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={formatTick}
          />
          <YAxis 
            stroke={tickColor}
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            allowDecimals={false} // Menghilangkan desimal
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }} 
            content={<CustomTooltip />}
          />
          <Bar 
            // PENTING: dataKey di sini adalah 'progress'
            dataKey="progress" 
            fill={barColor}
            radius={[4, 4, 0, 0]} 
            activeBar={{ fill: barHoverColor }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}