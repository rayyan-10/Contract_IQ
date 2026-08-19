import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, User, LogOut, ChevronDown, Check, Building2, Stethoscope } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { allNavGroups } from './navConfig';
import { Badge } from '@/components/common/Badge';
import type { BadgeVariant } from '@/types';

function getPageTitle(pathname: string): string {
  for (const group of allNavGroups) {
    for (const item of group.items) {
      if (pathname === item.path || pathname.startsWith(item.path + '/')) {
        return item.label;
      }
    }
  }
  return 'ContractIQ';
}

const notifTypeVariant: Record<string, BadgeVariant> = {
  alert: 'danger', warning: 'warning', info: 'info', success: 'success',
};

export function Header() {
  const { unreadCount, notifications, markNotificationRead, setSidebarOpen } = useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const RoleIcon = user?.role === 'ACO' ? Stethoscope : Building2;
  const roleBadgeClass = user?.role === 'ACO'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-brand-50 text-brand-700 border-brand-200';

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-surface-border flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-800">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Role badge */}
        {user && (
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${roleBadgeClass}`}>
            <RoleIcon className="w-3 h-3" />
            {user.role}
          </div>
        )}

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card-lg border border-surface-border z-40">
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Notifications</span>
                {unreadCount > 0 && <Badge variant="danger">{unreadCount} new</Badge>}
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                {notifications.map(n => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant={notifTypeVariant[n.type] ?? 'neutral'} dot className="mt-0.5 flex-shrink-0">
                        {n.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                      {!n.read && <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
              {user?.name ?? 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-card-lg border border-surface-border z-40">
              <div className="px-4 py-3 border-b border-surface-border">
                <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                {user?.acoId && (
                  <p className="text-xs text-slate-400 mt-0.5">ACO ID: {user.acoId}</p>
                )}
              </div>
              <ul className="py-1">
                <li>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
