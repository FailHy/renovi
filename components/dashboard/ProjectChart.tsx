// File: components/dashboard/ProjectChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface ChartData {
  name: string;
  progress: number;
}

interface ProjectProgressChartProps {
  data: ChartData[];
}

const STATUS_CONFIG: Record<
  string,
  { color: string; gradient: [string, string] }
> = {
  Perencanaan: { color: "#F59E0B", gradient: ["#FBBF24", "#F59E0B"] },
  Berlangsung: { color: "#3B82F6", gradient: ["#60A5FA", "#3B82F6"] },
  Selesai: { color: "#10B981", gradient: ["#34D399", "#10B981"] },
  Dibatalkan: { color: "#EF4444", gradient: ["#F87171", "#EF4444"] },
};

// Custom components outside render to avoid ESLint error
function CustomTooltip({
  active,
  payload,
  totalProjects,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartData }>;
  totalProjects: number;
}) {
  if (!active || !payload?.length) return null;
  const { name, progress } = payload[0].payload;
  const config = STATUS_CONFIG[name];
  const pct =
    totalProjects > 0 ? ((progress / totalProjects) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-100">
      <p className="font-bold text-gray-900 mb-2">{name}</p>
      <p className="text-sm text-gray-600">
        Jumlah: <span className="font-bold text-gray-900">{progress}</span>{" "}
        proyek
      </p>
      <p className="text-sm text-gray-600">
        Persentase:{" "}
        <span className="font-bold" style={{ color: config?.color }}>
          {pct}%
        </span>
      </p>
    </div>
  );
}

function CustomLabel({
  x = 0,
  y = 0,
  width = 0,
  value,
}: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) {
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#374151"
      textAnchor="middle"
      className="text-sm font-bold"
    >
      {value}
    </text>
  );
}

export default function ProjectProgressChart({
  data,
}: ProjectProgressChartProps) {
  const totalProjects = data.reduce((sum, item) => sum + item.progress, 0);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {data.map((item) => {
          const config = STATUS_CONFIG[item.name];
          const pct =
            totalProjects > 0
              ? ((item.progress / totalProjects) * 100).toFixed(0)
              : "0";
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: config?.color }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
              <span
                className="text-sm font-bold"
                style={{ color: config?.color }}
              >
                {item.progress}
              </span>
              <span className="text-xs text-gray-400">({pct}%)</span>
            </div>
          );
        })}
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 20, left: 0, bottom: 10 }}
            barCategoryGap="20%"
          >
            <defs>
              {Object.entries(STATUS_CONFIG).map(([name, config]) => (
                <linearGradient
                  key={name}
                  id={`gradient-${name}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={config.gradient[0]}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={config.gradient[1]}
                    stopOpacity={0.8}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip totalProjects={totalProjects} />}
              cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
            />
            <Bar
              dataKey="progress"
              name="Jumlah Proyek"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            >
              <LabelList dataKey="progress" content={<CustomLabel />} />
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${entry.name})`}
                  className="cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-lg font-bold text-blue-600">
            {totalProjects}
          </span>
          <span className="text-sm text-gray-600">proyek</span>
        </div>
      </div>
    </div>
  );
}
