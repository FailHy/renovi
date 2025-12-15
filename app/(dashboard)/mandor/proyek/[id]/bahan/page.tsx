import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProjectById } from '@/lib/actions/mandor/proyek';
import { getBahanMasukByProyek } from '@/lib/actions/mandor/bahan';
import { getMilestonesByProjectId } from '@/lib/actions/mandor/milestone';
import BahanDashboard from './BahanDashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BahanMasukPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized');
  }

  const { id: proyekId } = await params;
  const mandorId = session.user.id;

  let projectData = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bahanData: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let milestonesData: any[] = [];

  try {
    // 1. Verify project belongs to this mandor
    const projectResult = await getProjectById(proyekId);
    
    if (!projectResult.success || !projectResult.data) {
      console.error('Project not found or unauthorized:', projectResult.error);
      // We'll handle the redirect outside the try/catch or just return null to trigger not found UI if needed
    } else if (projectResult.data.mandorId !== mandorId) {
      console.error('Project does not belong to this mandor');
    } else {
      projectData = projectResult.data;

      // 2. Fetch bahan data
      const bahanResult = await getBahanMasukByProyek(proyekId);
      if (bahanResult.success && Array.isArray(bahanResult.data)) {
        bahanData = bahanResult.data;
      } else {
        console.warn('Failed to fetch bahan data:', bahanResult.error);
      }

      // 3. Fetch milestones data
      const milestonesResult = await getMilestonesByProjectId(proyekId);
      if (milestonesResult.success && Array.isArray(milestonesResult.data)) {
        milestonesData = milestonesResult.data;
      } else {
        console.warn('Failed to fetch milestones:', milestonesResult.error);
      }
    }
  } catch (error) {
    console.error('Error loading bahan page:', error);
  }

  if (!projectData) {
    redirect('/mandor/proyek');
  }

  return (
    <BahanDashboard
      proyek={projectData}
      bahanList={bahanData}
      milestones={milestonesData}
      mandorId={mandorId}
    />
  );
}