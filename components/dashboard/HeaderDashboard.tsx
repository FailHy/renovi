"use client";

import { useEffect, useState } from "react";

interface HeaderDashboardProps {
  title: string;
  description?: string;
}

export function HeaderDashboard({ title, description }: HeaderDashboardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const namaHari = hari[now.getDay()];
  const tanggal = now.getDate();
  const namaBulan = bulan[now.getMonth()];
  const tahun = now.getFullYear();

  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div className="flex items-start justify-between mb-">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* TANGGAL & JAM */}
      <div className="text-right">
        <p className="font-semibold text-foreground">
          {namaHari}, {tanggal} {namaBulan} {tahun}
        </p>
        <p className="text-sm text-muted-foreground">{jam}</p>
      </div>
    </div>
  );
}
