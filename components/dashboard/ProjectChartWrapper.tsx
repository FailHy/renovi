"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import dengan SSR disabled
const ProjectProgressChart = dynamic(
  () => import("@/components/dashboard/ProjectChart"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    )
  }
);

interface ProjectChartWrapperProps {
  data: Array<{ name: string; progress: number }>;
}

export default function ProjectChartWrapper({ data }: ProjectChartWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    );
  }

  return <ProjectProgressChart data={data} />;
}