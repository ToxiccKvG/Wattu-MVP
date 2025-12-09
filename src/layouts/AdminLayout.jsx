

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Download, 
  LogOut, 
  User, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

/**
 * Layout Admin
 * Sidebar avec navigation pour Dashboard, Signalements, Analytiques, Export
 */
function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/admin/dashboard',
      icon: LayoutDashboard,
      label: t('nav.dashboard', { defaultValue: 'Tableau de bord' })
    },
    {
      to: '/admin/reports',
      icon: FileText,
      label: t('nav.reports', { defaultValue: 'Signalements' })
    },
    {
      to: '/admin/analytics',
      icon: BarChart3,
      label: t('nav.analytics', { defaultValue: 'Analytics' })
    },
    // Note: Export sera implémenté plus tard (post-MVP)
    // {
    //   to: '/admin/export',
    //   icon: Download,
    //   label: t('nav.export', { defaultValue: 'Export' })
    // }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-neutral-200 shadow-sm">
        {/* Logo/Titre */}
        <div className="p-6 border-b border-neutral-200">
          <Logo size="md" withLink={false} />
          <p className="text-sm text-neutral-600 mt-2">
            {t('layout.admin_space', { defaultValue: 'Espace Admin' })}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info + Déconnexion */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {user?.email || 'Admin'}
              </p>
              <p className="text-xs text-neutral-500 uppercase">
                {t('layout.role_admin', { defaultValue: 'Administrateur' })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t('layout.logout', { defaultValue: 'Déconnexion' })}
          </Button>
        </div>
      </aside>

      {/* SIDEBAR MOBILE (Overlay) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <Logo size="md" withLink={false} />
                <p className="text-sm text-neutral-600 mt-2">
                  {t('layout.admin_space', { defaultValue: 'Espace Admin' })}
                </p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Info + Déconnexion */}
            <div className="p-4 border-t border-neutral-200">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-neutral-500 uppercase">
                    {t('layout.role_admin', { defaultValue: 'Administrateur' })}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('layout.logout', { defaultValue: 'Déconnexion' })}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-neutral-200 p-4 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-primary-600">WattU Admin</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Contenu */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

