import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './services/api.ts';
import {
  Ticket,
  TicketDetail,
  TicketStatus,
  TicketPriority,
  FilterState,
  ViewMode,
  NavTab,
  CreateTicketPayload,
  DashboardStats
} from './types.ts';
import { TopNav } from './components/TopNav.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { TicketsTable } from './components/TicketsTable.tsx';
import { KanbanBoard } from './components/KanbanBoard.tsx';
import { TicketDetailView } from './components/TicketDetailView.tsx';
import { NewTicketDrawer } from './components/NewTicketDrawer.tsx';
import { MetricsCards } from './components/MetricsCards.tsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  const [navTab, setNavTab] = useState<NavTab>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTicketsUnfiltered, setAllTicketsUnfiltered] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [filter, setFilter] = useState<FilterState>({
    status: 'All',
    search: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch all tickets unfiltered for global counts and metrics
  const fetchAllForCounts = useCallback(async () => {
    try {
      const data = await api.getTickets({});
      setAllTicketsUnfiltered(data);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  }, []);

  // Fetch filtered tickets (GET /api/tickets?status=...&search=...)
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTickets({
        status: filter.status,
        search: filter.search,
      });
      setTickets(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load and whenever filter changes
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchAllForCounts();
  }, [fetchAllForCounts]);

  // Fetch ticket details when a ticket is selected (GET /api/tickets/{ticket_id})
  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    let isMounted = true;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const detail = await api.getTicketById(selectedTicketId);
        if (isMounted) {
          setSelectedTicket(detail);
        }
      } catch (err: any) {
        if (isMounted) {
          showToast(err.message || 'Failed to load ticket details', 'error');
          setSelectedTicketId(null);
        }
      } finally {
        if (isMounted) {
          setDetailLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedTicketId]);

  // Handle Create Ticket (POST /api/tickets)
  const handleCreateTicket = async (payload: CreateTicketPayload) => {
    const result = await api.createTicket(payload);
    showToast(`Ticket ${result.ticket_id} created successfully`);
    await fetchTickets();
    await fetchAllForCounts();
    // Automatically select the new ticket to see details
    setSelectedTicketId(result.ticket_id);
  };

  // Handle Update Status (PUT /api/tickets/{ticket_id})
  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!selectedTicketId) return;
    try {
      await api.updateTicket(selectedTicketId, { status });
      showToast(`Status updated to "${status}"`);
      // Reload details and table list
      const updated = await api.getTicketById(selectedTicketId);
      setSelectedTicket(updated);
      fetchTickets();
      fetchAllForCounts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Handle Update Priority (PUT /api/tickets/{ticket_id})
  const handleUpdatePriority = async (priority: TicketPriority) => {
    if (!selectedTicketId) return;
    try {
      await api.updateTicket(selectedTicketId, { priority });
      showToast(`Priority updated to "${priority}"`);
      // Reload details and table list
      const updated = await api.getTicketById(selectedTicketId);
      setSelectedTicket(updated);
      fetchTickets();
      fetchAllForCounts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update priority', 'error');
    }
  };

  // Handle Add Note (PUT /api/tickets/{ticket_id})
  const handleAddNote = async (noteText: string) => {
    if (!selectedTicketId) return;
    try {
      await api.updateTicket(selectedTicketId, { notes: noteText });
      showToast('Note added to ticket');
      // Reload details
      const updated = await api.getTicketById(selectedTicketId);
      setSelectedTicket(updated);
      fetchAllForCounts();
    } catch (err: any) {
      showToast(err.message || 'Failed to add note', 'error');
    }
  };

  // Compute status counts for FilterBar pills
  const counts = useMemo(() => {
    const source = allTicketsUnfiltered;
    return {
      all: source.length,
      open: source.filter((t) => t.status === 'Open').length,
      in_progress: source.filter((t) => t.status === 'In Progress').length,
      closed: source.filter((t) => t.status === 'Closed').length,
    };
  }, [allTicketsUnfiltered]);

  // Compute dashboard metrics
  const stats: DashboardStats = useMemo(() => {
    return {
      total: counts.all,
      open: counts.open,
      in_progress: counts.in_progress,
      closed: counts.closed,
    };
  }, [counts]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Navigation */}
      <TopNav
        activeTab={navTab}
        onTabChange={(tab) => {
          setNavTab(tab);
          if (tab === 'tickets') {
            setSelectedTicketId(null);
          }
        }}
        onNewTicket={() => setIsDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-rose-900 text-rose-100 border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {selectedTicketId && selectedTicket ? (
          /* Ticket Detail View (GET /api/tickets/{ticket_id} & PUT /api/tickets/{ticket_id}) */
          <TicketDetailView
            ticket={selectedTicket}
            onBack={() => setSelectedTicketId(null)}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
            onAddNote={handleAddNote}
          />
        ) : selectedTicketId && detailLoading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs max-w-2xl mx-auto my-12 animate-pulse space-y-3">
            <div className="w-24 h-4 bg-slate-200 mx-auto rounded" />
            <div className="w-64 h-6 bg-slate-200 mx-auto rounded" />
            <div className="w-48 h-4 bg-slate-100 mx-auto rounded" />
          </div>
        ) : (
          /* Tickets Dashboard View */
          <div className="space-y-6 pb-16">
            {/* Top KPI Metrics Cards */}
            <MetricsCards stats={stats} loading={loading && allTicketsUnfiltered.length === 0} />

            {/* Filter and View Mode Controls */}
            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              counts={counts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tickets={tickets}
            />

            {/* List Table vs Kanban Board */}
            {viewMode === 'list' ? (
              <TicketsTable
                tickets={tickets}
                loading={loading}
                onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                onClearFilters={() => setFilter({ status: 'All', search: '' })}
              />
            ) : (
              <KanbanBoard
                tickets={tickets}
                onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                onUpdateStatus={async (ticketId, status) => {
                  await api.updateTicket(ticketId, { status });
                  showToast(`Moved ${ticketId} to ${status}`);
                  fetchTickets();
                  fetchAllForCounts();
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* New Ticket Drawer (POST /api/tickets) */}
      <NewTicketDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}

export default App;
