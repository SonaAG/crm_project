import React from 'react';
import { Ticket, TicketStatus } from '../types.ts';
import { Clock, User, ArrowRight } from 'lucide-react';

interface KanbanBoardProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onSelectTicket,
  onUpdateStatus,
}) => {
  const columns: { status: TicketStatus; label: string; headerClass: string; dotClass: string }[] = [
    {
      status: 'Open',
      label: 'Open',
      headerClass: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
      dotClass: 'bg-emerald-500',
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      headerClass: 'border-amber-500 bg-amber-50/50 text-amber-900',
      dotClass: 'bg-amber-500',
    },
    {
      status: 'Closed',
      label: 'Closed',
      headerClass: 'border-slate-400 bg-slate-100/50 text-slate-800',
      dotClass: 'bg-slate-400',
    },
  ];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
      {columns.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3 sm:p-4 flex flex-col gap-3 min-h-[450px]"
          >
            {/* Column Header */}
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-lg border-l-4 ${col.headerClass} bg-white shadow-xs`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                <span className="font-semibold text-xs">{col.label}</span>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {colTickets.length}
              </span>
            </div>

            {/* Ticket Cards */}
            <div className="space-y-2.5 overflow-y-auto">
              {colTickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No tickets in {col.label.toLowerCase()}
                </div>
              ) : (
                colTickets.map((ticket) => (
                  <div
                    key={ticket.ticket_id}
                    onClick={() => onSelectTicket(ticket.ticket_id)}
                    className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-indigo-600">
                          {ticket.ticket_id}
                        </span>
                        {ticket.priority && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              ticket.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-700'
                                : ticket.priority === 'High'
                                ? 'bg-orange-100 text-orange-700'
                                : ticket.priority === 'Low'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(ticket.created_at)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {ticket.subject}
                    </h4>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px] font-medium text-slate-700">
                          {ticket.customer_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-indigo-600 font-medium group-hover:underline">
                          View details
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
