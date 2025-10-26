
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/shared/Logo';
import LoginForm from '@/components/forms/LoginForm';

/**
 * Page de connexion pour agents et admins
 * 
 * Rôle :
 * - Affiche le formulaire de connexion (LoginForm)
 * - Force le FRANÇAIS (pas de toggle langue)
 * - Route cachée : /login (pas de lien visible pour citoyens)
 * - Redirige vers dashboard si déjà connecté
 * 
 * Fonctionnalités :
 * - Force langue FR au chargement
 * - Redirection automatique si user déjà auth
 * - Design centered avec logo
 * 
 * Sécurité :
 * - Route non listée publiquement (agents/admins connaissent l'URL)
 * - Validation et erreurs sécurisées (via LoginForm + authService)
 * 
 * Usage :
 * <Route path="/login" element={<Login />} />
 */
function Login() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { forceLanguage } = useLanguage();
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════
  // EFFETS
  // ═══════════════════════════════════════════════════════════

  /**
   * Effet 1 : Forcer le français
   * Login est réservé aux agents/admins → Français uniquement
   */
  useEffect(() => {
    forceLanguage('fr');
  }, [forceLanguage]);

  /**
   * Effet 2 : Rediriger si déjà connecté
   * 
   * Si user déjà authentifié, le rediriger vers son dashboard
   * - Agent → /agent/dashboard
   * - Admin → /admin/dashboard
   */
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const redirectPath = userRole === 'admin' 
        ? '/admin/dashboard' 
        : '/agent/dashboard';
      
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 px-4 py-8">
      {/* ═══════════════════════════════════════════════════════════
          LOGO / BRAND
          ═══════════════════════════════════════════════════════════ */}
      <div className="mb-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Logo size="xl" withLink={false} />
        </div>
        
        {/* Subtitle */}
        <p className="text-sm text-neutral-600">
          Plateforme de signalement citoyen
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          LOGIN FORM
          ═══════════════════════════════════════════════════════════ */}
      <LoginForm />

      {/* ═══════════════════════════════════════════════════════════
          FOOTER INFO
          ═══════════════════════════════════════════════════════════ */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          © 2025 WattU · v1.0.0
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Réservé aux agents et administrateurs
        </p>
      </div>
    </div>
  );
}

export default Login;

