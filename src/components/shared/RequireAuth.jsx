
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Composant de protection des routes (Route Guard)
 * 
 * Rôle :
 * - Vérifie si l'utilisateur est authentifié
 * - Si OUI → Affiche le contenu de la route (children)
 * - Si NON → Redirige vers /login
 * 
 * Utilisé pour :
 * - Protéger toutes les routes agent/admin
 * - Bloquer l'accès aux dashboards sans authentification
 * 
 * Fonctionnalités :
 * - Loading state (pendant vérification session)
 * - Redirection avec état (pour revenir après login)
 * - Affichage des enfants si authentifié
 * 
 * Usage dans App.jsx :
 * <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
 *   <Route path="/agent/dashboard" element={<AgentDashboard />} />
 * </Route>
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Composants à protéger
 */
function RequireAuth({ children }) {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // ═══════════════════════════════════════════════════════════
  // ÉTATS & LOGIQUE
  // ═══════════════════════════════════════════════════════════

  /**
   * État 1 : En cours de vérification (loading)
   * 
   * Pendant que AuthContext vérifie la session Supabase,
   * on affiche un loader pour éviter un "flash" de redirection
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          
          {/* Message */}
          <p className="text-sm text-neutral-600">
            Vérification de la session...
          </p>
        </div>
      </div>
    );
  }

  /**
   * État 2 : Non authentifié
   * 
   * Si pas de user connecté → Redirection vers /login
   * 
   * Fonctionnalité : Sauvegarde de la route demandée
   * - state={{ from: location }} permet de revenir après login
   * - Exemple : User essaie d'accéder à /agent/dashboard
   *   → Redirigé vers /login
   *   → Après login → Revient automatiquement sur /agent/dashboard
   */
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  /**
   * État 3 : Authentifié ✅
   * 
   * L'utilisateur est connecté → Afficher le contenu protégé
   */
  return children;
}

export default RequireAuth;

