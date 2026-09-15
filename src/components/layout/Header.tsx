import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Globe, Calendar as CalIcon } from 'lucide-react';

interface HeaderProps {
  onOpenScheduleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScheduleModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-background-white border-b border-border-light px-6 flex items-center justify-between sticky top-0 z-30 font-mono">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-text-l4 flex items-center gap-1 bg-background-light border border-border-light px-2.5 py-1 rounded-lg">
          <Globe className="w-3.5 h-3.5 text-text-l6" />
          <span>{user?.timezone || 'Asia/Kolkata'}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenScheduleModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-semantic-green hover:bg-semanticDark-green text-text-l1 hover:text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <CalIcon className="w-3.5 h-3.5" />
          <span>New Schedule</span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-border-light">
          <div className="w-8 h-8 rounded-full bg-background-muted border border-border-light flex items-center justify-center text-text-l2 font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-text-l1 leading-tight">{user?.name}</div>
            <div className="text-[11px] text-text-l6 leading-tight">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-text-l6 hover:text-semantic-red hover:bg-semanticLight-red rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
