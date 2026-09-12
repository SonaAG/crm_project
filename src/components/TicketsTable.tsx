import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  SearchX,
  Clock
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '../types.ts';

interface TicketsTableProps {
  tickets: Ticket[];
  loading: boolean;
  onSelectTicket: (ticketId: string) => void;
  onClearFilters: () => void;
}

export const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets,
  loading,
  onSelectTicket,
  onClearFilters,
}) => {
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(tickets.length / pageSize));
  const paginatedTickets = tickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(new Set(paginatedTickets.map((t) => t.ticket_id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectRow = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedTickets);
    if (next.has(ticketId)) {
      next.delete(ticketId);
    } else {
      next.add(ticketId);
    }
    setSelectedTickets(next);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-violet-100 text-violet-700',
      'bg-sky-100 text-sky-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatRelativeTime = (isoString: string) => {
    const created = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const renderPriorityBadge = (priority?: TicketPriority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold ring-1 ring-inset ring-rose-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[11px] font-semibold ring-1 ring-inset ring-orange-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            High
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold ring-1 ring-inset ring-slate-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
      case 'Medium':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold ring-1 ring-inset ring-blue-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Medium
          </span>
        );
    }
  };

  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-inset ring-emerald-600/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
            </span>
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-inset ring-amber-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            In Progress
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold ring-1 ring-inset ring-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Closed
          </span>
        );
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
            <div className="w-16 h-4 bg-slate-200 rounded" />
            <div className="w-48 h-4 bg-slate-200 rounded" />
            <div className="w-64 h-4 bg-slate-200 rounded" />
            <div className="w-20 h-5 bg-slate-200 rounded-full" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No tickets found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          No support tickets matched your current search criteria or status filter.
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium text-xs transition-colors"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 h-10">
              <th className="w-10 px-4 py-2.5 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginatedTickets.length > 0 &&
                    paginatedTickets.every((t) => selectedTickets.has(t.ticket_id))
                  }
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600 h-3.5 w-3.5"
                />
              </th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px]">
                Ticket ID
              </th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px]">
                Customer Name
              </th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px]">
                Subject
              </th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px]">
                Priority
              </th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px]">
                Status
              </th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px]">
                Created At
              </th>
              <th className="w-10 px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-[11px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTickets.map((ticket) => {
              const isSelected = selectedTickets.has(ticket.ticket_id);
              return (
                <tr
                  key={ticket.ticket_id}
                  onClick={() => onSelectTicket(ticket.ticket_id)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                    isSelected ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 py-3.5 text-center" onClick={(e) => handleSelectRow(ticket.ticket_id, e)}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600 h-3.5 w-3.5"
                    />
                  </td>

                  {/* Ticket ID */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-mono font-semibold text-xs text-indigo-600 group-hover:underline">
                      {ticket.ticket_id}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarColor(
                          ticket.customer_name
                        )}`}
                      >
                        {getInitials(ticket.customer_name)}
                      </div>
                      <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                        {ticket.customer_name}
                      </span>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-3.5 max-w-xs md:max-w-md">
                    <p className="font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {ticket.subject}
                    </p>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {renderPriorityBadge(ticket.priority)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {renderStatusBadge(ticket.status)}
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    <span title={ticket.created_at} className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatRelativeTime(ticket.created_at)}
                    </span>
                  </td>

                  {/* Arrow Action */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{tickets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, tickets.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{tickets.length}</span> tickets
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
