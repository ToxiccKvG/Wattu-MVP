
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
   * @returns {Promise<Object>} Profil complet : { id, name, email, role, commune_id }
   * @throws {Error} Si user introuvable ou erreur DB
   * 
   * Le role peut être : 'agent' | 'admin'
   * Le commune_id est null pour les admins, obligatoire pour les agents
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, commune_id')
      .eq('id', userId)
      .single(); // .single() car on attend 1 seul résultat

    if (error) throw error;
    return data;
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

