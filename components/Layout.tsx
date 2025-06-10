import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth, usePermissions } from '../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  ComputerDesktopIcon,
  CommandLineIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canManageUsers, canManageClients, canExecuteTasks, canViewAuditLogs } = usePermissions();
  const router = useRouter();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/dashboard/users', icon: UsersIcon, permission: 'manage_users' },
    { name: 'Clients', href: '/dashboard/clients', icon: ComputerDesktopIcon, permission: 'manage_clients' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CommandLineIcon, permission: 'execute_tasks' },
    { name: 'Audit Logs', href: '/dashboard/audit', icon: DocumentTextIcon, permission: 'view_audit' },
    { name: 'Security', href: '/dashboard/security', icon: ShieldCheckIcon, permission: 'view_audit' },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true;
    
    switch (item.permission) {
      case 'manage_users':
        return canManageUsers();
      case 'manage_clients':
        return canManageClients();
      case 'execute_tasks':
        return canExecuteTasks();
      case 'view_audit':
        return canViewAuditLogs();
      default:
        return true;
    }
  });

  const handleLogout = async () => {
    await logout();
  };

  const isCurrentPath = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={filteredNavigation} isCurrentPath={isCurrentPath} />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <SidebarContent navigation={filteredNavigation} isCurrentPath={isCurrentPath} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <button
                  type="button"
                  className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="ml-4 text-lg font-semibold text-gray-900 lg:ml-0">
                  {title}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-6 w-6" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Logout"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar content component
const SidebarContent: React.FC<{
  navigation: NavItem[];
  isCurrentPath: (href: string) => boolean;
}> = ({ navigation, isCurrentPath }) => {
  return (
    <>
      <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">Endpoint Manager</div>
            <div className="text-xs text-gray-500">v1.1.0</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = isCurrentPath(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Layout;
