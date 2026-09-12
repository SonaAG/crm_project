import React from 'react';
import { Inbox, AlertCircle, Clock, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { DashboardStats } from '../types.ts';

interface MetricsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Card 1: Total Tickets */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Tickets
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Inbox className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {loading ? '—' : stats.total}
          </span>
          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            <TrendingUp className="w-3 h-3" />
            +12%
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>from last week</span>
          <svg className="w-16 h-5 text-emerald-600 overflow-visible" fill="none" viewBox="0 0 64 20">
            <path
              d="M0 16 Q 16 14, 28 8 T 52 4 L 64 2"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Open Tickets */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Open
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {loading ? '—' : stats.open}
          </span>
          <span className="bg-rose-50 text-rose-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            {stats.open > 0 ? `${Math.min(stats.open, 3)} SLA risk` : 'All caught up'}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500 truncate">
          Requires initial triage or response
        </p>
      </div>

      {/* Card 3: In Progress */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {loading ? '—' : stats.in_progress}
          </span>
          <span className="text-xs text-slate-500">across 4 dispatchers</span>
        </div>
        <p className="mt-3 text-xs text-slate-500 truncate">
          Under active engineering investigation
        </p>
      </div>

      {/* Card 4: Resolved Today */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Resolved Today
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {loading ? '—' : stats.closed}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
            <Zap className="w-3 h-3" />
            Fast
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500 truncate">
          Avg resolution velocity: 2.1 hours
        </p>
      </div>
    </div>
  );
};
