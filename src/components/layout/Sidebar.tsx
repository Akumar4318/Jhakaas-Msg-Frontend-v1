import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Sparkles,
  Smartphone,
  Settings,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  onOpenScheduleModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenScheduleModal }) => {
  const navItems = [
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon, badge: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/contacts', label: 'Contacts', icon: Users },
    { to: '/messages/history', label: 'Messages', icon: MessageSquare },
    { to: '/holidays', label: 'Holidays', icon: Sparkles },
    { to: '/whatsapp', label: 'WhatsApp', icon: Smartphone },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-background-white border-r border-border-light flex flex-col shrink-0 h-screen sticky top-0 font-mono">
      {/* Brand Header */}
      <div className="p-5 border-b border-border-light flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-semantic-green flex items-center justify-center text-text-l1 shadow-sm">
          <MessageSquare className="w-5 h-5 fill-current text-background-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-l1 leading-tight">WhatsApp Scheduler</h1>
          <span className="text-[11px] text-semanticDark-green font-medium bg-semanticLight-green px-1.5 py-0.5 rounded border border-semantic-green/30">
            Calendar First
          </span>
        </div>
      </div>

      {/* Global Quick Action */}
      <div className="p-4">
        <button
          type="button"
          onClick={onOpenScheduleModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-semantic-green hover:bg-semanticDark-green text-text-l1 hover:text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Message</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-semanticLight-green text-semanticDark-green font-bold border border-semantic-green/40'
                    : 'text-text-l4 hover:bg-background-light hover:text-text-l1',
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-semanticLight-green text-semanticDark-green border border-semantic-green/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-border-light text-[11px] text-text-l6 text-center">
        v1.0 • JetBrains Mono Theme
      </div>
    </aside>
  );
};
