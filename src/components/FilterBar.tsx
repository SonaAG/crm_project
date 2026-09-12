import React, { useRef, useEffect } from 'react';
import {
  Search,
  Download,
  List,
  Kanban,
  X
} from 'lucide-react';
import { FilterState, TicketStatus, ViewMode, Ticket } from '../types.ts';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    closed: number;
  };
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  tickets: Ticket[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  counts,
  viewMode,
  onViewModeChange,
  tickets,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStatusClick = (status: 'All' | TicketStatus) => {
    onFilterChange({ ...filter, status });
  };

  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const headers = ['Ticket ID', 'Customer Name', 'Subject', 'Priority', 'Status', 'Created At'];
    const rows = tickets.map((t) => [
      `"${t.ticket_id}"`,
      `"${t.customer_name.replace(/"/g, '""')}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      `"${t.priority || 'Medium'}"`,
      `"${t.status}"`,
      `"${t.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
              {counts.all} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer requests, triage issues, and track resolutions in real time.
          </p>
        </div>

        {/* View toggles & Export */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            title="Export filtered tickets as CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              title="Kanban Board View"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Status Tabs + Search */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'All Tickets', count: counts.all },
            { id: 'Open', label: 'Open', count: counts.open, dot: 'bg-emerald-500' },
            { id: 'In Progress', label: 'In Progress', count: counts.in_progress, dot: 'bg-amber-500' },
            { id: 'Closed', label: 'Closed', count: counts.closed, dot: 'bg-slate-400' },
          ].map((tab) => {
            const isActive = filter.status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleStatusClick(tab.id as 'All' | TicketStatus)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.dot && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-white' : tab.dot
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input (?search=customer_name) */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            placeholder="Search by customer name, subject..."
            className="w-full pl-8 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
          />
          {filter.search ? (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded">
                ⌘K
              </kbd>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
