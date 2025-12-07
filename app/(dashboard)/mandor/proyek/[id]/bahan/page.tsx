// FILE: app/(dashboard)/mandor/proyek/[id]/bahan/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProjectById } from '@/lib/actions/mandor/proyek';
import { getBahanMasukByProyek, getBahanSummary } from '@/lib/actions/mandor/bahan';
import { getMilestonesByProjectId } from '@/lib/actions/mandor/milestone';
import BahanDashboard from './BahanDashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BahanMasukPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'mandor') {
    redirect('/login');
  }

  const { id: proyekId } = await params;
  const mandorId = session.user.id;

  // Fetch all data in parallel
  const [projectResult, bahanResult, milestonesResult] = await Promise.all([
    getProjectById(mandorId),
    getBahanMasukByProyek(proyekId),
    getMilestonesByProjectId(mandorId)
  ]);

  // Check authorization
  if (!projectResult.success || projectResult.error === 'Akses ditolak') {
    redirect('/unauthorized');
  }

  return (
    <BahanDashboard
      proyek={projectResult.data}
      bahanList={bahanResult.success ? bahanResult.data : []}
      milestones={milestonesResult.success ? milestonesResult.data : []}
      mandorId={mandorId}
    />
  );
}