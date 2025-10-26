
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';

/**
 * Layout pour les dashboards AGENT et ADMIN
 * 
 * Rôle :
 * - Wrapper commun pour toutes les pages protégées (agents/admins)
 * - Force le FRANÇAIS (pas de toggle langue)
 * - Affiche header avec nom user + bouton déconnexion
 * - Sidebar/navigation (placeholder pour MVP)
 * 
 * Différence avec PublicLayout :
 * - ❌ PAS de LanguageSwitcher (français forcé)
 * - ✅ Bouton déconnexion
 * - ✅ Affiche rôle + nom de l'utilisateur
 * - ✅ Navigation dashboard (sidebar pour stages futurs)
 * 
 * Utilisé pour :
 * - /agent/* (Agent Dashboard)
 * - /admin/* (Admin Dashboard)
 * 
 * Design :
 * - Header fixe avec infos user + logout
 * - Zone de contenu principale (Outlet)
 * - Mobile-first responsive
 * - Français uniquement
 * 
 * Usage :
 * <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
 *   <Route path="/agent/dashboard" element={<AgentDashboard />} />
 *   <Route path="/admin/dashboard" element={<AdminDashboard />} />
 * </Route>
 */
function DashboardLayout() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { t } = useTranslation();
  const { forceLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════
  // EFFETS
  // ═══════════════════════════════════════════════════════════

  /**
   * Forcer le français au montage du composant
   * 
   * Même si le citoyen était en Wolof, on force le français
   * pour les agents/admins (cohérence + clarté)
   */
  useEffect(() => {
    forceLanguage('fr');
  }, [forceLanguage]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Gérer la déconnexion
   */
  const handleLogout = async () => {
    const result = await logout('fr');
    if (result.success) {
      // Redirection vers home (gérée par AuthContext)
      console.log('✅ Déconnexion réussie');
    } else {
      console.error('❌ Erreur déconnexion:', result.error);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Logo + Menu toggle (pour sidebar future) */}
          <div className="flex items-center gap-4">
            {/* Menu toggle (placeholder pour MVP) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl">
                W
              </div>
              <span className="text-xl font-bold text-neutral-900">
                WattU
              </span>
              {/* Badge rôle */}
              <span className="hidden md:inline-flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                {user?.role === 'admin' ? 'Admin' : 'Agent'}
              </span>
            </div>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-3">
            {/* User name (hidden on mobile) */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-neutral-900">
                {user?.name || 'Utilisateur'}
              </span>
              <span className="text-xs text-neutral-500">
                {user?.email}
              </span>
            </div>

            {/* Logout button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              aria-label={t('dashboard.logout', { defaultValue: 'Déconnexion' })}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('dashboard.logout', { defaultValue: 'Déconnexion' })}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* React Router rend le composant de la route ici */}
        <Outlet />
      </main>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER (optionnel, simplifié pour dashboards)
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-xs text-neutral-500">
            © 2025 WattU · {t('dashboard.version', { defaultValue: 'v1.0.0' })}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout;

