import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Logo } from './Logo';
import { cmsNavGroups, acoNavGroups } from './navConfig';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import type { NavGroup } from '@/types';

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, setSidebarOpen } = useApp();
  const { user } = useAuth();
  const collapsed = !mobile && sidebarCollapsed;
  const location = useLocation();

  // Show only the nav groups relevant to the user's role
  const navGroups: NavGroup[] = user?.role === 'ACO' ? acoNavGroups : cmsNavGroups;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside
      className={[
        'flex flex-col h-full bg-white border-r border-surface-border transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-surface-border flex-shrink-0">
        <Logo collapsed={collapsed} />
        {mobile ? (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 flex-shrink-0"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6" aria-label="Main navigation">
        {navGroups.map(group => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                {group.group}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => mobile && setSidebarOpen(false)}
                      className={[
                        'sidebar-item',
                        active ? 'active' : '',
                        collapsed ? 'justify-center px-0' : '',
                      ].join(' ')}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="sidebar-item-icon" aria-hidden="true" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-surface-border flex-shrink-0">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-slate-400">© 2026 ContractIQ</p>
            <p className="text-[10px] text-slate-300">v0.1.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}
