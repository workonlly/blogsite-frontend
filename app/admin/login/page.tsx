'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminSession, isValidAdminCredentials, readAdminSession, saveAdminSession } from '../adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (readAdminSession()) {
      router.replace('/admin');
    }
  }, [router]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    window.setTimeout(() => {
      if (!isValidAdminCredentials(username, password)) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }

      saveAdminSession(createAdminSession(username));
      router.replace('/admin');
      router.refresh();
      setLoading(false);
    }, 150);
  };

  return (
    <section className="mx-auto my-16 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
      <p className="mt-1 text-sm text-slate-600">
        Frontend-only login. Session is stored in your browser and expires automatically.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">User ID</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            autoComplete="current-password"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </section>
  );
}
