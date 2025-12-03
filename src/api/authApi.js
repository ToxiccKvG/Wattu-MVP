
import { supabase } from '@/config/supabase';

/**
 * API Layer pour l'authentification via Supabase
 * 
 * Rôle : Appels directs à Supabase UNIQUEMENT (pas de logique métier)
 * Les erreurs sont laissées brutes (throw error) - elles seront transformées dans authService.js
 * 
 * Fonctions disponibles :
 * - signIn(email, password) : Connexion utilisateur
 * - signOut() : Déconnexion utilisateur
 * - getSession() : Récupère la session active
 * - getUserProfile(userId) : Récupère le profil complet depuis table "users"
 */
export const authApi = {
  /**
   * Connexion avec email et mot de passe
   * 
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<{user, session}>} User et session Supabase si succès
   * @throws {Error} Erreur Supabase brute (sera transformée dans authService)
   * 
   * Erreurs possibles :
   * - "Invalid login credentials" : Email ou mot de passe incorrect
   * - "Email not confirmed" : Email non confirmé
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data; // { user, session }
  },

  /**
   * Déconnexion de l'utilisateur
   * Supprime la session et les tokens
   * 
   * @returns {Promise<void>}
   * @throws {Error} Si erreur pendant la déconnexion
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Récupère la session active
   * Utile pour vérifier si un utilisateur est déjà connecté au chargement de l'app
   * 
   * @returns {Promise<Session|null>} Session active ou null si pas connecté
   * @throws {Error} Si erreur lors de la récupération
   * 
   * Session contient :
   * - user : Infos user Supabase (id, email, etc.)
   * - access_token : JWT token pour les requêtes
   * - refresh_token : Token pour renouveler la session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session; // null si pas de session active
  },

  /**
   * Récupère le profil complet d'un utilisateur depuis la table "users"
   * 
   * Cette fonction est nécessaire car Supabase Auth ne stocke que l'email.
   * Nos infos métier (role, commune_id, name) sont dans la table "users".
   * 
   * @param {string} userId - UUID de l'utilisateur (depuis auth.users)
   * @returns {Promise<Object>} Profil complet : { id, name, email, role, commune_id, age }
   * @throws {Error} Si user introuvable ou erreur DB
   * 
   * Le role peut être : 'agent' | 'admin' | 'citizen'
   * Le commune_id est null pour les admins, optionnel pour les citoyens
   * L'age est optionnel pour tous les utilisateurs
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, commune_id, age, phone')
      .eq('id', userId)
      .single(); // .single() car on attend 1 seul résultat

    if (error) throw error;
    return data;
  },

  /**
   * Met à jour le profil d'un utilisateur
   * 
   * @param {string} userId - UUID de l'utilisateur
   * @param {Object} updates - Champs à mettre à jour (age, commune_id, name, etc.)
   * @returns {Promise<Object>} Profil mis à jour
   * @throws {Error} Si erreur lors de la mise à jour
   */
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Inscription d'un nouveau citoyen (DÉSACTIVÉ - Plus utilisé)
   * 
   * ⚠️ Cette méthode n'est plus utilisée. L'inscription se fait uniquement via OAuth Google.
   * Conservée pour référence future si besoin d'inscription email/password.
   * 
   * @param {string} email - Email du citoyen
   * @param {string} password - Mot de passe
   * @param {Object} metadata - Métadonnées utilisateur (nom, prénom, âge, commune, adresse, phone)
   * @param {string} redirectTo - URL de redirection après confirmation email (optionnel)
   * @returns {Promise<{user, session}>} User et session Supabase si succès
   * @throws {Error} Erreur Supabase brute (sera transformée dans authService)
   * 
   * Erreurs possibles :
   * - "User already registered" : Email déjà utilisé
   * - "Password too weak" : Mot de passe trop faible
   */
  /* async signUp(email, password, metadata = {}, redirectTo = null) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // Métadonnées stockées dans user_metadata
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/confirm-email`,
      },
    });

    if (error) throw error;
    return data; // { user, session }
  }, */

  /**
   * Connexion via OAuth (Google, etc.)
   * 
   * @param {string} provider - Provider OAuth ('google', 'facebook', etc.)
   * @param {Object} options - Options pour la redirection OAuth
   * @param {string} options.redirectTo - URL de redirection après OAuth (optionnel)
   * @returns {Promise<{url: string|null, error: Error|null}>} URL de redirection OAuth ou erreur
   * @throws {Error} Si erreur lors de l'initialisation OAuth
   * 
   * Exemple d'utilisation :
   * const { data, error } = await authApi.signInWithOAuth('google', {
   *   redirectTo: window.location.origin + '/auth/callback'
   * });
   * if (data.url) {
   *   window.location.href = data.url; // Rediriger vers Google
   * }
   */
  async signInWithOAuth(provider, options = {}) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options.redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: options.queryParams || {},
        skipBrowserRedirect: options.skipBrowserRedirect || false,
      },
    });

    if (error) throw error;
    return data; // { url: string }
  },

  /**
   * Écoute les changements d'état d'authentification
   * 
   * Utile pour détecter :
   * - Connexion réussie
   * - Déconnexion
   * - Expiration de session
   * - Token rafraîchi
   * 
   * @param {Function} callback - Fonction appelée à chaque changement d'état
   * @returns {Object} Subscription (pour unsubscribe plus tard)
   * 
   * Exemple d'utilisation :
   * const { data: { subscription } } = authApi.onAuthStateChange((event, session) => {
   *   if (event === 'SIGNED_IN') console.log('User connecté', session);
   *   if (event === 'SIGNED_OUT') console.log('User déconnecté');
   * });
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authApi;

