
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { authApi } from '@/api/authApi';

/**
 * Context pour la gestion globale de l'authentification
 * 
 * Rôle : 
 * - Stocke l'état d'authentification (user, loading, error)
 * - Fournit les fonctions d'auth (login, logout) accessibles partout
 * - Vérifie l'auth au chargement de l'app (session persistante)
 * - Écoute les changements d'état Supabase (connexion, déconnexion)
 * 
 * Usage :
 * 1. Wrapper l'app avec <AuthProvider>
 * 2. Utiliser le hook useAuth() dans n'importe quel composant
 * 
 * Exemple :
 * const { user, isAuthenticated, login, logout } = useAuth();
 */

// Création du Context
const AuthContext = createContext(null);

/**
 * Provider du Context d'authentification
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Composants enfants
 */
export function AuthProvider({ children }) {
  // ═══════════════════════════════════════════════════════════
  // ÉTAT GLOBAL
  // ═══════════════════════════════════════════════════════════
  
  /**
   * User actuellement connecté
   * Structure : { id, name, email, role: 'agent' | 'admin', commune_id }
   */
  const [user, setUser] = useState(null);
  
  /**
   * État de chargement (pendant vérification session, login, logout)
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Message d'erreur (si erreur pendant login/logout)
   */
  const [error, setError] = useState(null);

  // Hook pour navigation (redirection après login)
  const navigate = useNavigate();

  /**
   * Flag pour tracker l'initialisation
   * Permet d'éviter les appels redondants lors du premier chargement
   * (Supabase émet plusieurs événements au démarrage)
   */
  const isInitialized = useRef(false);

  // ═══════════════════════════════════════════════════════════
  // FONCTIONS D'AUTHENTIFICATION
  // ═══════════════════════════════════════════════════════════

  /**
   * Connexion d'un utilisateur
   * 
   * Process :
   * 1. Appelle authService.login() (qui gère validation + sécurité)
   * 2. Si succès → Stocke user dans state
   * 3. Redirige vers dashboard approprié selon rôle
   * 4. Si erreur → Stocke message d'erreur
   * 
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} language - Langue pour messages d'erreur ('fr' | 'wo')
   * @returns {Promise<{success: boolean, error?: string}>}
   * 
   * Exemple :
   * const result = await login('admin@wattu.sn', 'password', 'fr');
   * if (result.success) {
   *   // Redirection automatique vers /admin/dashboard
   * } else {
   *   console.log(result.error); // "Email ou mot de passe incorrect"
   * }
   */
  const login = async (email, password, language = 'fr') => {
    try {
      setLoading(true);
      setError(null);

      // Appel authService pour connexion sécurisée
      const result = await authService.login(email, password, language);

      if (result.success) {
        // Succès : Stocker le user dans le state
        setUser(result.user);

        // Déterminer la route de redirection selon le rôle
        const redirectPath = authService.getRedirectPath(result.user.role);

        // Redirection vers le dashboard approprié
        navigate(redirectPath);

        return { success: true };
      } else {
        // Échec : Stocker l'erreur
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      // Erreur inattendue (normalement déjà gérée par authService)
      const errorMessage = language === 'fr' 
        ? 'Une erreur est survenue. Veuillez réessayer' 
        : 'Am na ci njumte. Jéematul';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion de l'utilisateur
   * 
   * Process :
   * 1. Appelle authService.logout()
   * 2. Supprime user du state
   * 3. Redirige vers page d'accueil
   * 
   * @param {string} language - Langue pour messages d'erreur
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const logout = async (language = 'fr') => {
    try {
      setLoading(true);
      setError(null);

      // Appel authService pour déconnexion
      const result = await authService.logout(language);

      if (result.success) {
        // Succès : Nettoyer le state
        setUser(null);

        // Redirection vers page d'accueil
        navigate('/');

        return { success: true };
      } else {
        // Échec (rare, mais possible)
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = language === 'fr' 
        ? 'Erreur lors de la déconnexion' 
        : 'Njumte ci génn';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérification de l'authentification au chargement de l'app
   * 
   * Appelée automatiquement au montage du composant
   * Vérifie si une session Supabase existe
   * 
   * Process :
   * 1. Appelle authService.getCurrentUser()
   * 2. Si user trouvé → Stocke dans state (user reste connecté)
   * 3. Si pas de user → Reste déconnecté
   */
  const checkAuth = async () => {
    try {
      setLoading(true);

      // Vérifier si session active existe
      const result = await authService.getCurrentUser();

      if (result.success && result.user) {
        // Session active trouvée : User est connecté
        setUser(result.user);
      } else {
        // Pas de session : User déconnecté
        setUser(null);
      }
    } catch (err) {
      // Si erreur, considérer comme déconnecté
      console.error('Erreur vérification auth:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Nettoyer le message d'erreur
   * Utile après affichage d'une erreur dans l'UI
   */
  const clearError = () => {
    setError(null);
  };

  // ═══════════════════════════════════════════════════════════
  // EFFETS (useEffect)
  // ═══════════════════════════════════════════════════════════

  /**
   * Effet 1 : Vérification auth au chargement de l'app
   * 
   * Déclenché une seule fois au montage du composant
   * Permet de restaurer la session si l'user était déjà connecté
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Effet 2 : Écoute des changements d'état Supabase
   * 
   * Supabase peut notifier des changements :
   * - SIGNED_OUT : User vient de se déconnecter
   * - TOKEN_REFRESHED : Token a été rafraîchi (géré automatiquement par Supabase)
   * 
   * Note : On ne gère plus SIGNED_IN ici (déjà géré par checkAuth au démarrage)
   * Cela évite les boucles infinies d'événements lors de l'initialisation
   */
  useEffect(() => {
    // Souscription aux changements d'état Supabase
    const { data: authListener } = authApi.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);

      // ✅ FIX : Ignorer le premier événement (déjà géré par checkAuth)
      if (!isInitialized.current) {
        isInitialized.current = true;
        console.log('⏭️ Skipping initial auth event');
        return;
      }

      // ✅ FIX : Ne réagir qu'aux vrais changements (déconnexion)
      if (event === 'SIGNED_OUT') {
        // User vient de se déconnecter (via autre onglet ou expiration)
        console.log('👋 User signed out');
        setUser(null);
      }
      // Note : Les refresh de token sont gérés automatiquement par Supabase
    });

    // Cleanup : Se désabonner quand le composant est démonté
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // VALEURS DU CONTEXT (accessibles via useAuth())
  // ═══════════════════════════════════════════════════════════

  const value = {
    // État
    user,                              // User connecté ou null
    loading,                           // true pendant chargement
    error,                             // Message d'erreur ou null
    isAuthenticated: !!user,           // true si user connecté
    
    // Fonctions
    login,                             // Connexion
    logout,                            // Déconnexion
    checkAuth,                         // Vérifier session
    clearError,                        // Nettoyer erreur
    
    // Helpers (dérivés de user)
    userRole: user?.role || null,     // 'agent' | 'admin' | null
    userName: user?.name || null,      // Nom de l'utilisateur
    userEmail: user?.email || null,    // Email de l'utilisateur
    communeId: user?.commune_id || null, // ID commune (pour agents)
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour accéder au Context d'authentification
 * 
 * Usage :
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * @returns {Object} Valeurs et fonctions du context
 * @throws {Error} Si utilisé hors d'un AuthProvider
 * 
 * Exemple :
 * function MyComponent() {
 *   const { user, logout } = useAuth();
 *   
 *   return (
 *     <div>
 *       <p>Bonjour {user.name}</p>
 *       <button onClick={logout}>Déconnexion</button>
 *     </div>
 *   );
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }

  return context;
}

export default AuthContext;

