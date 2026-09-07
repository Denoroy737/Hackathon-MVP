import type { Metadata } from 'next';
import { Dashboard } from '@/components/Dashboard';
export const metadata: Metadata = { title: 'Your progress — Suraksha Coach' };
export default function DashboardPage() { return <Dashboard />; }
