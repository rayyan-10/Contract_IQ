import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  return (
    <aside className={[
      'flex flex-col h-full bg-maroon-900 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60',
    ].join(' ')}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logos.png" alt="ContractIQ" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-base font-bold text-cream-100 tracking-tight leading-none">ContractIQ</p>
              <p className="text-[9px] text-cream-400 mt-0.5 truncate">Analytics Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <img src="/logos.png" alt="ContractIQ" className="w-8 h-8 rounded-lg object-contain mx-auto" />
        )}
        {!collapsed && (
          mobile ? (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-cream-400 hover:bg-white/10 hover:text-cream-100 transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg text-cream-400 hover:bg-white/10 hover:text-cream-100 transition-colors flex-shrink-0" aria-label="Collapse">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )
        )}
        {collapsed && !mobile && (
          <button onClick={() => setSidebarCollapsed(false)} className="absolute top-4 right-1 p-1 rounded-lg text-cream-400 hover:bg-white/10 hover:text-cream-100 transition-colors" aria-label="Expand">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[10px] font-bold uppercase tracking-wide text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {user?.role ?? 'CMS'} Workspace
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1" aria-label="Main navigation">
        {navGroups.map(group => (
          <div key={group.group} className="mb-4">
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-2 text-amber-400/70">
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
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-amber-400">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-cream-200 truncate">{user?.name ?? 'User'}</p>
              <p className="text-[9px] text-cream-400/60 truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-400">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
