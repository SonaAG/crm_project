import React from 'react';
import {
  MessageSquare,
  Plus
} from 'lucide-react';
import { NavTab } from '../types.ts';

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewTicket: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onNewTicket,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand + Navigation */}
        <div className="flex items-center gap-6">
          {/* Brand */}
          <div
            onClick={() => onTabChange('tickets')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <MessageSquare className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-base text-slate-900 tracking-tight">
              SupportFlow CRM
            </span>
          </div>
        </div>

        {/* Right: + New Ticket Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewTicket}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>
    </header>
  );
};
