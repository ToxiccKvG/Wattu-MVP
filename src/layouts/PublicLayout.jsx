
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/shared/Logo';
import BottomNavigation from '@/components/shared/BottomNavigation';

/**
 * Layout pour les pages publiques (CITOYENS)
 * 
 * Rôle :
 * - Wrapper commun pour toutes les pages accessibles sans authentification
 * - Affiche le header avec logo et bouton de déconnexion
 * - Restaure la langue sauvegardée du citoyen (si vient d'une page forcée en FR)
 * 
 * Utilisé pour :
 * - HomePage (/)
 * - Autres pages publiques futures
 * 
 * Design :
 * - Header fixe en haut (avec logo + bouton déconnexion)
 * - Zone de contenu principale avec fond sombre (Outlet pour React Router)
 * - Bottom navigation (mobile)
 * - Mobile-first responsive
 * 
 * Usage :
 * <Route element={<PublicLayout />}>
 *   <Route path="/" element={<HomePage />} />
 * </Route>
 */
function PublicLayout() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { t } = useTranslation();
  const { restoreLanguage } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════
  // EFFETS
  // ═══════════════════════════════════════════════════════════

  /**
   * Restaurer la langue sauvegardée du citoyen
   * 
   * Si le citoyen arrive depuis une page avec langue forcée (login),
   * on restaure sa langue préférée (FR ou Wolof)
   */
  useEffect(() => {
    restoreLanguage();
  }, [restoreLanguage]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b bg-black shadow-sm">
        <div className="container mx-auto flex flex-row items-center justify-start relative py-0.5 md:py-1 px-4 md:px-6">
          {/* Logo WattU - À gauche */}
          <Logo size="xl" linkTo="/home" />

          {/* Right side: Déconnexion - Aligné avec le logo */}
          <div className="absolute right-4 md:right-6 flex items-center gap-3 top-[80%] -translate-y-1/2">
            {/* Déconnexion */}
            <button
              onClick={async () => {
                const result = await logout('fr');
                if (result.success) {
                  navigate('/welcome');
                }
              }}
              className="px-4 py-2.5 rounded-lg text-base font-medium text-white bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              aria-label={t('nav.logout', { defaultValue: 'Déconnexion' })}
            >
              {t('nav.logout', { defaultValue: 'Déconnexion' })}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8 pb-20 bg-black">
        {/* React Router rend le composant de la route ici */}
        <Outlet />
      </main>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM NAVIGATION (MOBILE)
          ═══════════════════════════════════════════════════════════ */}
      <BottomNavigation />
    </div>
  );
}

export default PublicLayout;

