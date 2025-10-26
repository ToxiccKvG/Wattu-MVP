
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import { LayoutDashboard, FileText, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Layout principal pour les pages AGENT
 * 
 * Fonctionnalités :
 * - Sidebar avec navigation
 * - Header avec nom de l'agent + logout
 * - Responsive (sidebar collapsible sur mobile)
 * - Français uniquement (forcé par App.jsx)
 * 
 * Navigation :
 * - Dashboard (/agent/dashboard)
 * - Signalements (/agent/reports)
 * 
 * Usage :
 * <Route path="/agent" element={<AgentLayout />}>
 *   <Route path="dashboard" element={<AgentDashboard />} />
 *   <Route path="reports" element={<ReportList />} />
 * </Route>
 */
function AgentLayout() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { user, userName, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Déconnexion
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /**
   * Fermer la sidebar sur mobile après navigation
   */
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION ITEMS
  // ═══════════════════════════════════════════════════════════

  const navItems = [
    {
      label: 'Tableau de bord',
      path: '/agent/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Signalements',
      path: '/agent/reports',
      icon: FileText
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* ═══════════════════════════════════════════════════════════
          SIDEBAR (Desktop + Mobile)
          ═══════════════════════════════════════════════════════════ */}
      
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-neutral-200 z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <Logo size="md" withLink={false} />
                <p className="text-xs text-neutral-600 mt-2">Espace Agent</p>
              </div>
              {/* Bouton fermer (mobile uniquement) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={closeSidebar}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer : User info + Logout */}
          <div className="p-4 border-t border-neutral-200 space-y-3">
            <div className="px-2">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {userName || 'Agent'}
              </p>
              <p className="text-xs text-neutral-600 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          CONTENU PRINCIPAL
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary-600">WattU</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AgentLayout;

