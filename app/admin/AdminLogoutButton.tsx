'use client';

import { useRouter } from 'next/navigation';
import { clearAdminSession } from './adminAuth';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    clearAdminSession();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
    >
      Logout
    </button>
  );
}
