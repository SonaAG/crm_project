import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  User,
  Send,
  MessageSquare,
  Copy,
  Check,
  Mail,
  ChevronDown,
  Flag
} from 'lucide-react';
import { TicketDetail, TicketStatus, TicketPriority } from '../types.ts';

interface TicketDetailViewProps {
  ticket: TicketDetail;
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => Promise<void>;
  onUpdatePriority?: (priority: TicketPriority) => Promise<void>;
  onAddNote: (noteText: string) => Promise<void>;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticket,
  onBack,
  onUpdateStatus,
  onUpdatePriority,
  onAddNote,
}) => {
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

  const handlePostNote = async () => {
    if (!noteText.trim() || isSubmittingNote) return;
    setIsSubmittingNote(true);
    try {
      await onAddNote(noteText.trim());
      setNoteText('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ticket.customer_email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Quick Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={onBack}
              className="hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tickets</span>
            </button>
            <span>/</span>
            <span className="font-mono text-slate-700 font-semibold">{ticket.ticket_id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              {ticket.ticket_id}
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Right: Status & Priority Dropdowns */}
        <div className="flex items-center gap-2.5">
          {/* Priority Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPriorityMenuOpen(!priorityMenuOpen);
                setStatusMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-normal">Priority:</span>
              <span
                className={`font-semibold ${
                  ticket.priority === 'Urgent'
                    ? 'text-rose-600'
                    : ticket.priority === 'High'
                    ? 'text-orange-600'
                    : ticket.priority === 'Low'
                    ? 'text-slate-600'
                    : 'text-blue-600'
                }`}
              >
                {ticket.priority || 'Medium'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {priorityMenuOpen && onUpdatePriority && (
              <div
                className="absolute right-0 mt-1.5 w-40 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-xs"
                onClick={() => setPriorityMenuOpen(false)}
              >
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Change Priority
                </div>
                {(['Low', 'Medium', 'High', 'Urgent'] as TicketPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => onUpdatePriority(p)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                      (ticket.priority || 'Medium') === p
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{p}</span>
                    {(ticket.priority || 'Medium') === p && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setStatusMenuOpen(!statusMenuOpen);
                setPriorityMenuOpen(false);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span className="text-slate-400 font-normal">Status:</span>
              <span
                className={`font-semibold ${
                  ticket.status === 'Open'
                    ? 'text-emerald-700'
                    : ticket.status === 'In Progress'
                    ? 'text-amber-700'
                    : 'text-slate-700'
                }`}
              >
                {ticket.status}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {statusMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-44 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-xs"
                onClick={() => setStatusMenuOpen(false)}
              >
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Change Status
                </div>
                {(['Open', 'In Progress', 'Closed'] as TicketStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(st)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                      ticket.status === st
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st}</span>
                    {ticket.status === st && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: 8 Cols Content / 4 Cols Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Issue Description, Activity Timeline, Note Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Issue Card */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(ticket.customer_name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {ticket.customer_name}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Customer
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span>{ticket.customer_email}</span>
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  ticket.status === 'Open'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                    : ticket.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                    : 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20'
                }`}
              >
                {ticket.status}
              </span>
            </div>

            {/* Description Text */}
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {ticket.description}
            </div>
          </div>

          {/* Activity & Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              <span>Activity & Notes ({ticket.notes ? ticket.notes.length : 0})</span>
              <span>Chronological</span>
            </div>

            {/* Notes List */}
            {(!ticket.notes || ticket.notes.length === 0) ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No notes on this ticket yet. Add a note below to record triage steps or updates.
              </div>
            ) : (
              ticket.notes.map((note, index) => (
                <div
                  key={note.id || index}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <MessageSquare className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-xs text-slate-900">
                        Note #{index + 1}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(note.created_at)}
                    </span>
                  </div>

                  <p className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {note.note_text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Note Composer (PUT /api/tickets/{ticket_id} with { notes }) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Add Note to Ticket</span>
              </label>
            </div>

            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handlePostNote();
                }
              }}
              placeholder="Type note details or resolution steps here..."
              className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600 transition-colors"
            />

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handlePostNote}
                disabled={!noteText.trim() || isSubmittingNote}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingNote ? 'Saving Note...' : 'Submit Note'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Info & Customer Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Customer Details
            </span>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                {getInitials(ticket.customer_name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {ticket.customer_name}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                  {ticket.customer_email}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Email Copied!' : 'Copy Customer Email'}</span>
            </button>
          </div>

          {/* Ticket Schema Attributes */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Database Record
            </span>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ticket ID</span>
              <span className="font-mono font-bold text-indigo-600">{ticket.ticket_id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Status</span>
              <span className="font-semibold text-slate-800">{ticket.status}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Priority Level</span>
              <span
                className={`font-semibold ${
                  ticket.priority === 'Urgent'
                    ? 'text-rose-600'
                    : ticket.priority === 'High'
                    ? 'text-orange-600'
                    : ticket.priority === 'Low'
                    ? 'text-slate-600'
                    : 'text-blue-600'
                }`}
              >
                {ticket.priority || 'Medium'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Notes Logged</span>
              <span className="font-mono text-slate-700 font-semibold">
                {ticket.notes ? ticket.notes.length : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
