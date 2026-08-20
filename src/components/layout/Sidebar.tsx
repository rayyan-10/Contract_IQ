import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Activity } from 'lucide-react';
import { cmsNavGroups, acoNavGroups } from './navConfig';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import type { NavGroup } from '@/types';

interface SidebarProps { mobile?: boolean }

export function Sidebar({ mobile = false }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, setSidebarOpen } = useApp();
  const { user } = useAuth();
  const collapsed  = !mobile && sidebarCollapsed;
  const location   = useLocation();
  const isAco      = user?.role === 'ACO';
  const navGroups: NavGroup[] = isAco ? acoNavGroups : cmsNavGroups;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  // Accent colours per role
  const accent = isAco
    ? { dot: 'bg-emerald-400', label: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' }
    : { dot: 'bg-indigo-400',  label: 'text-indigo-400',  badge: 'bg-indigo-500/15  text-indigo-300  border-indigo-500/25'  };

  return (
    <aside className={[
      'flex flex-col h-full bg-[#0d1220] border-r border-white/6 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60',
    ].join(' ')}>

      {/* ── Logo header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/6 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0 shadow-lg shadow-indigo-900/40">
              <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white tracking-tight leading-none">ContractIQ</p>
              <p className="text-[9px] text-slate-500 mt-0.5 truncate">Analytics Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 mx-auto shadow-lg shadow-indigo-900/40">
            <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
        )}
        {!collapsed && (
          mobile ? (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0" aria-label="Collapse">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )
        )}
        {collapsed && !mobile && (
          <button onClick={() => setSidebarCollapsed(false)} className="absolute top-4 right-2 p-1 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white transition-colors" aria-label="Expand">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Role badge ──────────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/6">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${accent.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
            {user?.role ?? 'CMS'} Workspace
          </span>
          {user?.acoName && (
            <p className="text-[10px] text-slate-500 mt-1 truncate">{user.acoName}</p>
          )}
        </div>
      )}

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1" aria-label="Main navigation">
        {navGroups.map(group => (
          <div key={group.group} className="mb-4">
            {!collapsed && (
              <p className={`text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-2 ${accent.label}`}>
                {group.group}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map(item => {
                const Icon   = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => mobile && setSidebarOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={[
                        'sidebar-item',
                        active ? 'active' : '',
                        collapsed ? 'justify-center px-0 py-3' : '',
                      ].join(' ')}
                    >
                      <Icon className="sidebar-item-icon" aria-hidden="true" />
                      {!collapsed && <span>{item.label}</span>}
                      {/* Active left bar */}
                      {active && !collapsed && (
                        <span className={`ml-auto w-1 h-4 rounded-full ${isAco ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-white/6 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.name ?? 'User'}</p>
              <p className="text-[9px] text-slate-600 truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

