// File: components/dashboard/ProjectChart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts'

interface ChartData {
  name: string
  progress: number
}

interface ProjectProgressChartProps {
  data: ChartData[]
}

export default function ProjectProgressChart({ data }: ProjectProgressChartProps) {
  // Warna untuk setiap status
  const COLORS: Record<string, string> = {
    'Perencanaan': '#F59E0B', // Yellow/Orange
    'Berlangsung': '#3B82F6', // Blue
    'Selesai': '#10B981', // Green
    'Dibatalkan': '#EF4444', // Red
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const tooltipData = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            {tooltipData.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-bold">{tooltipData.progress}</span> proyek
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="progress" 
            name="Jumlah Proyek"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name] || '#3B82F6'} 
              />
            ))}
          </Bar> 
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
