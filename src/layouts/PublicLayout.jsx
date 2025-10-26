
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LangContext';
import Logo from '@/components/shared/Logo';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import BottomNavigation from '@/components/shared/BottomNavigation';

/**
 * Layout pour les pages publiques (CITOYENS)
 * 
 * Rôle :
 * - Wrapper commun pour toutes les pages accessibles sans authentification
 * - Affiche le header avec LanguageSwitcher (FR/Wolof)
 * - Restaure la langue sauvegardée du citoyen (si vient d'une page forcée en FR)
 * 
 * Utilisé pour :
 * - HomePage (/)
 * - Autres pages publiques futures
 * 
 * Design :
 * - Header fixe en haut (avec logo + LanguageSwitcher)
 * - Zone de contenu principale (Outlet pour React Router)
 * - Footer simple (optionnel)
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
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo WattU */}
          <Logo size="md" linkTo="/" />

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8 pb-20">
        {/* React Router rend le composant de la route ici */}
        <Outlet />
      </main>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t bg-white py-6 mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-sm text-neutral-600">
              © 2025 WattU. {t('footer.rights', { defaultValue: 'Tous droits réservés.' })}
            </p>

            {/* Links (optionnel pour MVP) */}
            <div className="flex gap-4 text-sm text-neutral-600">
              <a 
                href="#" 
                className="hover:text-primary-600 transition-colors"
                aria-label={t('footer.about', { defaultValue: 'À propos' })}
              >
                {t('footer.about', { defaultValue: 'À propos' })}
              </a>
              <a 
                href="#" 
                className="hover:text-primary-600 transition-colors"
                aria-label={t('footer.contact', { defaultValue: 'Contact' })}
              >
                {t('footer.contact', { defaultValue: 'Contact' })}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM NAVIGATION (MOBILE)
          ═══════════════════════════════════════════════════════════ */}
      <BottomNavigation />
    </div>
  );
}

export default PublicLayout;

