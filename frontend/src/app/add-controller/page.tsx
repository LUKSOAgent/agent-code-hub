'use client';

import { useRouter } from 'next/navigation';
import { ControllerAuthorization } from '@/views/ControllerAuth';

export default function AddControllerPage() {
  const router = useRouter();
  return <ControllerAuthorization onBack={() => router.push('/')} />;
}
