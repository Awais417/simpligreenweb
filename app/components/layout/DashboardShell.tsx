'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { ROLE_LABELS } from '../../lib/utils';
import type { Role } from '../../lib/types';
import { Avatar } from '../Avatar';
import { useCurrentPageTitle } from './PageTitleContext';
import {
  JobsIcon,
  LogoutIcon,
  MenuIcon,
  OverviewIcon,
  ProfileIcon,
  TagIcon,
  TasksIcon,
  UsersIcon,
} from './icons';

interface NavItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  exact?: boolean;
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  admin: [
    { href: '/admin', label: 'Overview', icon: OverviewIcon, exact: true },
    { href: '/admin/jobs', label: 'Jobs', icon: JobsIcon },
    { href: '/admin/users', label: 'Users', icon: UsersIcon },
    { href: '/admin/installer-types', label: 'Installer Types', icon: TagIcon },
  ],
  manager: [{ href: '/manager', label: 'Jobs', icon: JobsIcon, exact: true }],
  installer: [{ href: '/installer', label: 'My Tasks', icon: TasksIcon, exact: true }],
  qa: [{ href: '/qa', label: 'Jobs', icon: JobsIcon, exact: true }],
};

function isActivePath(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname.startsWith(item.href);
}

export function DashboardShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const title = useCurrentPageTitle();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_CONFIG[role];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">SimpliGreen</p>
          <p className="text-xs text-gray-400 leading-tight">{ROLE_LABELS[role]} Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active ? 'bg-brand-light text-brand-dark' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href={`/${role}/profile`}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            ${pathname === `/${role}/profile` ? 'bg-brand-light text-brand-dark' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <ProfileIcon className="w-5 h-5 shrink-0" />
          Profile
        </Link>
      </nav>

      <div className="px-3 pb-6 pt-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogoutIcon className="w-5 h-5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-gray-100 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{sidebarContent}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden text-gray-500 cursor-pointer p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          </div>

          {user && (
            <Link href={`/${role}/profile`} className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
              </div>
              <Avatar name={user.name} avatar={user.avatar} />
            </Link>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
