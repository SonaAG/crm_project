import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  User,
  Mail,
  FileText,
  AlertCircle,
  Flag,
  Activity
} from 'lucide-react';
import { CreateTicketPayload, TicketPriority, TicketStatus } from '../types.ts';

interface NewTicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTicketPayload) => Promise<void>;
}

export const NewTicketDrawer: React.FC<NewTicketDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [status, setStatus] = useState<TicketStatus>('Open');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Handle Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        newErrors.customerEmail = 'Please provide a valid email address';
      }
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        subject: subject.trim(),
        description: description.trim(),
        priority,
        status,
      });

      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setSubject('');
      setDescription('');
      setPriority('Medium');
      setStatus('Open');
      setErrors({});
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to create ticket' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Ticket</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the details below to log a customer support issue.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errors.form && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none transition-colors ${
                    errors.customerName
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.customerName && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. eleanor.vance@enterprise-stack.io"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none transition-colors ${
                    errors.customerEmail
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.customerEmail && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.customerEmail}</p>
              )}
            </div>

            {/* Priority and Status row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Flag className="w-4 h-4" />
                  </div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-none bg-white transition-colors cursor-pointer text-slate-800"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Status <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-none bg-white transition-colors cursor-pointer text-slate-800"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none transition-colors ${
                    errors.subject
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.subject && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information regarding the customer issue, logs, or error codes..."
                className={`w-full p-3 text-sm rounded-lg border focus:outline-none transition-colors ${
                  errors.description
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
              {errors.description && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.description}</p>
              )}
            </div>
          </form>

          {/* Footer Buttons */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Creating Ticket...' : 'Create Ticket'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
