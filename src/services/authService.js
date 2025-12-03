
import { authApi } from '@/api/authApi';
import { getSecureErrorMessage } from '@/utils/errorMessages';

/**
 * Service Layer pour l'authentification
 * 
 * Rôle : Logique métier + Transformation des erreurs en messages sécurisés
 * 
 * Architecture :
 * - Utilise authApi.js pour les appels Supabase
 * - Capture TOUTES les erreurs
 * - Transforme en messages utilisateur sécurisés (via errorMessages.js)
 * - Retourne toujours { success: true/false, data/error }
 * 
 * Sécurité :
 * - Ne JAMAIS exposer les erreurs techniques Supabase
 * - Toujours utiliser getSecureErrorMessage()
 */
export const authService = {
  /**
   * Connexion complète d'un utilisateur
   * 
   * Process :
   * 1. Appel authApi.signIn() pour authentifier
   * 2. Appel authApi.getUserProfile() pour récupérer role/commune
   * 3. Retourne user complet avec session
   * 4. Si erreur → Transformation en message sécurisé
   * 
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} language - Langue pour messages d'erreur ('fr' | 'wo')
   * @returns {Promise<{success: boolean, user?: Object, session?: Object, error?: string}>}
   * 
   * Exemple succès :
   * {
   *   success: true,
   *   user: { id, name, email, role: 'agent', commune_id },
   *   session: { access_token, refresh_token, ... }
   * }
   * 
   * Exemple erreur :
   * {
   *   success: false,
   *   error: "Email ou mot de passe incorrect"
   * }
   */
  async login(email, password, language = 'fr') {
    try {
      // Validation basique côté client (avant appel API)
      if (!email || !password) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Email et mot de passe requis'
            : 'Email ak mot de passe amoul dara',
        };
      }

      // Étape 1 : Authentification via Supabase Auth
      const { user: authUser, session } = await authApi.signIn(email, password);

      // Étape 2 : Récupération du profil complet (role, commune, name, age, phone)
      const userProfile = await authApi.getUserProfile(authUser.id);
      
      console.log('📥 Profil récupéré après login:', {
        id: userProfile.id,
        name: userProfile.name,
        email: authUser.email,
        role: userProfile.role,
        commune_id: userProfile.commune_id,
        age: userProfile.age,
        phone: userProfile.phone,
      });

      // Étape 3 : Fusion des données
      const completeUser = {
        ...userProfile,
        email: authUser.email, // S'assurer qu'on a l'email
      };

      // Succès : Retourner user + session
      return {
        success: true,
        user: completeUser,
        session,
      };

    } catch (error) {
      // ⭐ SÉCURITÉ : Transformer l'erreur en message sécurisé
      const secureMessage = getSecureErrorMessage(error, language);

      return {
        success: false,
        error: secureMessage,
      };
    }
  },

  /**
   * Inscription d'un nouveau citoyen (DÉSACTIVÉ - Plus utilisé)
   * 
   * ⚠️ Cette méthode n'est plus utilisée. L'inscription se fait uniquement via OAuth Google.
   * Conservée pour référence future si besoin d'inscription email/password.
   * 
   * Process :
   * 1. Appel authApi.signUp() pour créer le compte Supabase Auth
   * 2. Créer le profil dans la table "users" avec role = 'citizen'
   * 3. Retourne le user complet avec session
   * 
   * @param {string} email - Email du citoyen
   * @param {string} password - Mot de passe
   * @param {Object} metadata - Métadonnées (first_name, last_name, age, commune_id, address, phone)
   * @param {string} language - Langue pour messages d'erreur ('fr' | 'wo')
   * @returns {Promise<{success: boolean, user?: Object, session?: Object, error?: string}>}
   */
  /* async signUp(email, password, metadata = {}, language = 'fr') {
    try {
      // Validation basique
      if (!email || !password) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Email et mot de passe requis'
            : 'Email ak mot de passe amoul dara',
        };
      }

      // Étape 1 : Créer le compte Supabase Auth avec redirection vers page de confirmation
      const redirectTo = `${window.location.origin}/auth/confirm-email`;
      const { user: authUser, session } = await authApi.signUp(email, password, metadata, redirectTo);

      if (!authUser) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Erreur lors de la création du compte'
            : 'Njumte ci defar compte bi',
        };
      }

      // Étape 2 : Créer le profil dans la table "users" (role = 'citizen' pour citoyen)
      const { supabase } = await import('@/config/supabase');
      
      // Préparer les données pour l'insertion
      // Convertir age en entier (peut être un nombre ou une string)
      let ageValue = null;
      if (metadata.age !== null && metadata.age !== undefined && metadata.age !== '') {
        const parsedAge = typeof metadata.age === 'number' ? metadata.age : parseInt(metadata.age);
        ageValue = isNaN(parsedAge) ? null : parsedAge;
      }
      
      // Nettoyer le téléphone
      const phoneValue = metadata.phone && typeof metadata.phone === 'string' && metadata.phone.trim() !== '' 
        ? metadata.phone.trim() 
        : null;
      
      console.log('📝 Création profil signup avec:', {
        id: authUser.id,
        email: authUser.email,
        name: metadata.full_name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || email.split('@')[0],
        role: 'citizen',
        commune_id: metadata.commune_id || null,
        age: ageValue,
        phone: phoneValue,
        'metadata.age (original)': metadata.age,
        'metadata.phone (original)': metadata.phone,
      });
      
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: metadata.full_name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || email.split('@')[0],
          role: 'citizen', // Citoyen
          commune_id: metadata.commune_id || null,
          age: ageValue,
          phone: phoneValue,
        })
        .select()
        .single();

      if (profileError) {
        console.error('🔴 Erreur création profil signup:', profileError);
        console.error('🔴 Détails:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });
        // Si erreur création profil, on continue quand même (l'utilisateur peut se connecter)
        // MAIS on retourne une erreur pour que l'utilisateur soit informé
        return {
          success: false,
          error: language === 'fr'
            ? 'Erreur lors de la création du profil. Veuillez réessayer.'
            : 'Njumte ci defar sa profil. Jéematul.',
        };
      } else {
        console.log('✅ Profil créé avec succès:', userProfile);
        console.log('✅ Vérification des données:', {
          age: userProfile?.age,
          phone: userProfile?.phone,
          commune_id: userProfile?.commune_id,
        });
      }

      // Succès : Retourner user + session
      return {
        success: true,
        user: userProfile || {
          id: authUser.id,
          email: authUser.email,
          name: metadata.full_name || email.split('@')[0],
          role: 'citizen',
          commune_id: metadata.commune_id || null,
          age: metadata.age || null,
          phone: metadata.phone || null,
        },
        session,
      };

    } catch (error) {
      // Transformer l'erreur en message sécurisé
      const secureMessage = getSecureErrorMessage(error, language);

      return {
        success: false,
        error: secureMessage,
      };
    }
  }, */

  /**
   * Connexion via OAuth (Google, etc.)
   * 
   * Process :
   * 1. Appel authApi.signInWithOAuth() pour obtenir l'URL de redirection OAuth
   * 2. Retourne l'URL pour redirection vers le provider
   * 3. Après callback OAuth, le profil utilisateur sera créé automatiquement (via trigger DB)
   * 
   * @param {string} provider - Provider OAuth ('google', 'facebook', etc.)
   * @param {Object} options - Options pour la redirection
   * @param {string} options.redirectTo - URL de callback après OAuth
   * @param {string} language - Langue pour messages d'erreur ('fr' | 'wo')
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   * 
   * Exemple d'utilisation :
   * const result = await authService.loginWithOAuth('google');
   * if (result.success && result.url) {
   *   window.location.href = result.url; // Rediriger vers Google
   * }
   */
  async loginWithOAuth(provider, options = {}, language = 'fr') {
    try {
      // Construire l'URL de callback (par défaut: /auth/callback)
      const redirectTo = options.redirectTo || `${window.location.origin}/auth/callback`;

      // Appel API pour obtenir l'URL de redirection OAuth
      const { url } = await authApi.signInWithOAuth(provider, {
        redirectTo,
        queryParams: options.queryParams || {},
        skipBrowserRedirect: options.skipBrowserRedirect || false,
      });

      if (!url) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Impossible d\'initialiser la connexion OAuth'
            : 'Man naa dugg ci OAuth',
        };
      }

      // Succès : Retourner l'URL de redirection
      return {
        success: true,
        url,
      };

    } catch (error) {
      // Transformer l'erreur en message sécurisé
      const secureMessage = getSecureErrorMessage(error, language);

      return {
        success: false,
        error: secureMessage,
      };
    }
  },

  /**
   * Gère le callback OAuth après redirection
   * 
   * Cette fonction doit être appelée sur la page /auth/callback
   * après que Supabase ait traité le callback OAuth.
   * 
   * Process :
   * 1. Récupère la session depuis l'URL (Supabase gère automatiquement)
   * 2. Vérifie si le profil utilisateur existe dans la table "users"
   * 3. Si nouveau user OAuth → Crée le profil (role: null par défaut, à assigner manuellement)
   * 4. Retourne le user complet
   * 
   * @param {string} language - Langue pour messages d'erreur
   * @returns {Promise<{success: boolean, user?: Object, isNewUser?: boolean, error?: string}>}
   */
  async handleOAuthCallback(language = 'fr') {
    try {
      // Récupérer la session (Supabase a déjà traité le callback)
      const session = await authApi.getSession();

      if (!session || !session.user) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Aucune session trouvée après connexion OAuth'
            : 'Amul session ci OAuth',
        };
      }

      // Vérifier si le profil existe dans la table "users"
      let userProfile;
      try {
        userProfile = await authApi.getUserProfile(session.user.id);
      } catch (error) {
        // Profil n'existe pas → Créer un nouveau profil pour user OAuth
        // Note: Pour les citoyens, on peut créer un profil sans role
        // Pour agents/admins, le role doit être assigné manuellement par un admin
        const { supabase } = await import('@/config/supabase');
        
        const { data, error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
            role: 'citizen', // Citoyen par défaut pour OAuth
            commune_id: null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('🔴 Erreur insertion profil OAuth:', insertError);
          console.error('🔴 Détails:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });
          throw insertError;
        }
        
        userProfile = data;
        
        return {
          success: true,
          user: {
            ...userProfile,
            email: session.user.email,
          },
          isNewUser: true,
        };
      }

      // Profil existe déjà → Retourner le user
      return {
        success: true,
        user: {
          ...userProfile,
          email: session.user.email,
        },
        isNewUser: false,
      };

    } catch (error) {
      // Transformer l'erreur en message sécurisé
      const secureMessage = getSecureErrorMessage(error, language);

      return {
        success: false,
        error: secureMessage,
      };
    }
  },

  /**
   * Déconnexion de l'utilisateur
   * 
   * Process :
   * 1. Appel authApi.signOut() pour invalider la session Supabase
   * 2. Retourne succès ou erreur sécurisée
   * 
   * @param {string} language - Langue pour messages d'erreur
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout(language = 'fr') {
    try {
      await authApi.signOut();

      return {
        success: true,
      };

    } catch (error) {
      // Transformer l'erreur en message sécurisé
      const secureMessage = getSecureErrorMessage(error, language);

      return {
        success: false,
        error: secureMessage,
      };
    }
  },

  /**
   * Récupère l'utilisateur actuellement connecté
   * 
   * Utilisé au chargement de l'app pour vérifier si une session existe
   * 
   * Process :
   * 1. Appel authApi.getSession() pour vérifier session active
   * 2. Si session existe → Récupérer le profil complet
   * 3. Si profil n'existe pas (citoyen OAuth) → Créer profil minimal
   * 4. Retourne user ou null
   * 
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   * 
   * Exemple succès avec user :
   * {
   *   success: true,
   *   user: { id, name, email, role, commune_id }
   * }
   * 
   * Exemple succès sans user (pas de session) :
   * {
   *   success: true,
   *   user: null
   * }
   */
  async getCurrentUser() {
    try {
      // Récupérer la session active
      const session = await authApi.getSession();

      // Pas de session = pas d'utilisateur connecté
      if (!session || !session.user) {
        return {
          success: true,
          user: null,
        };
      }

      // Session existe → Récupérer le profil complet
      let userProfile;
      try {
        userProfile = await authApi.getUserProfile(session.user.id);
      } catch (error) {
        // Profil n'existe pas (peut arriver pour citoyens OAuth)
        // Créer un profil minimal depuis les métadonnées Supabase Auth
        const { supabase } = await import('@/config/supabase');
        
        const metadata = session.user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Utilisateur';
        
        // Essayer de créer le profil (peut échouer si contrainte DB, mais on continue)
        try {
          const { data, error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: fullName,
              role: 'citizen', // Citoyen
              commune_id: null,
              age: null,
              phone: null,
            })
            .select()
            .single();

          if (!insertError && data) {
            userProfile = data;
          }
        } catch (insertErr) {
          // Si création échoue, on continue avec un profil minimal
          console.warn('Impossible de créer le profil, utilisation des métadonnées:', insertErr);
        }

        // Si toujours pas de profil, créer un objet minimal
        if (!userProfile) {
          userProfile = {
            id: session.user.id,
            email: session.user.email,
            name: fullName,
            role: 'citizen', // Citoyen
            commune_id: null,
            age: null,
            phone: null,
          };
        }
      }

      return {
        success: true,
        user: {
          ...userProfile,
          email: session.user.email,
        },
      };

    } catch (error) {
      // Si erreur (ex: session expirée), retourner null
      // (on ne veut pas afficher d'erreur à l'utilisateur au chargement de l'app)
      console.error('Erreur récupération user:', error);

      return {
        success: true,
        user: null,
      };
    }
  },

  /**
   * Crée un compte citoyen avec les données collectées via l'inscription vocale
   * 
   * Process :
   * 1. Génère un mot de passe sécurisé automatiquement
   * 2. Crée le compte Supabase Auth avec email/password
   * 3. Crée le profil dans la table "users" avec toutes les données (role = 'citizen')
   * 4. Retourne le user complet avec session
   * 
   * Note : Le mot de passe généré sera envoyé par email à l'utilisateur
   * (à implémenter via Supabase Auth email templates)
   * 
   * @param {Object} data - Données collectées via l'inscription vocale
   * @param {string} data.firstName - Prénom
   * @param {string} data.lastName - Nom
   * @param {number} data.age - Âge
   * @param {string} data.commune_id - UUID de la commune
   * @param {string} data.phone - Numéro de téléphone
   * @param {string} data.address - Adresse
   * @param {string} data.email - Email
   * @param {string} language - Langue pour messages d'erreur ('fr' | 'wo')
   * @returns {Promise<{success: boolean, user?: Object, session?: Object, error?: string}>}
   */
  async createCitizenAccount(data, language = 'fr') {
    try {
      // Validation des données requises
      if (!data.email || !data.firstName || !data.lastName) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Email, prénom et nom sont obligatoires'
            : 'Email, tur bu jëkk ak tur bu mag dafay wara am',
        };
      }

      // Générer un mot de passe sécurisé (12 caractères : lettres, chiffres, symboles)
      const generateSecurePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const generatedPassword = generateSecurePassword();

      // Préparer les métadonnées pour Supabase Auth
      const metadata = {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`,
        age: data.age || null,
        commune_id: data.commune_id || null,
        phone: data.phone || null,
        address: data.address || null,
      };

      // Étape 1 : Créer le compte Supabase Auth
      // Note : On utilise signUp mais sans emailRedirectTo car on veut une session immédiate
      const { supabase } = await import('@/config/supabase');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: generatedPassword,
        options: {
          data: metadata,
          // Désactiver la confirmation email pour l'instant (on peut l'activer plus tard)
          emailRedirectTo: null,
        },
      });

      if (authError) {
        console.error('🔴 Erreur création compte Supabase Auth:', authError);
        throw authError;
      }

      if (!authData.user) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Erreur lors de la création du compte'
            : 'Njumte ci defar compte bi',
        };
      }

      // Étape 2 : Créer le profil dans la table "users"
      const ageValue = data.age ? parseInt(data.age) : null;
      const phoneValue = data.phone && typeof data.phone === 'string' 
        ? data.phone.replace(/\D/g, '') // Nettoyer le téléphone
        : null;

      console.log('📝 Création profil citoyen vocal:', {
        id: authData.user.id,
        email: authData.user.email,
        name: `${data.firstName} ${data.lastName}`,
        role: 'citizen',
        commune_id: data.commune_id || null,
        age: ageValue,
        phone: phoneValue,
      });

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: `${data.firstName} ${data.lastName}`,
          role: 'citizen',
          commune_id: data.commune_id || null,
          age: ageValue,
          phone: phoneValue,
        })
        .select()
        .single();

      if (profileError) {
        console.error('🔴 Erreur création profil citoyen vocal:', profileError);
        console.error('🔴 Détails:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });

        return {
          success: false,
          error: language === 'fr'
            ? 'Erreur lors de la création du profil. Veuillez réessayer.'
            : 'Njumte ci defar sa profil. Jéematul.',
        };
      }

      console.log('✅ Profil citoyen vocal créé avec succès:', userProfile);

      // Étape 3 : Vérifier si on a une session (Supabase peut créer une session automatiquement)
      // Si pas de session, essayer de se connecter
      let session = authData.session;
      
      if (!session) {
        // Essayer de se connecter automatiquement avec le mot de passe généré
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: generatedPassword,
        });

        if (!signInError && signInData?.session) {
          session = signInData.session;
        } else {
          console.warn('⚠️ Pas de session immédiate, mais le compte est créé');
          // Le compte est créé, mais pas de session - l'utilisateur devra se connecter manuellement
          // TODO: Implémenter l'envoi d'email avec le mot de passe
        }
      }

      // Succès : Retourner user + session
      return {
        success: true,
        user: {
          ...userProfile,
          email: authData.user.email,
        },
        session: session || null,
        // Note : Le mot de passe généré devrait être envoyé par email
        // TODO: Implémenter l'envoi d'email avec le mot de passe via Supabase Auth email templates
      };

    } catch (error) {
      // Transformer l'erreur en message sécurisé
      const secureMessage = getSecureErrorMessage(error, language);

      return {
        success: false,
        error: secureMessage,
      };
    }
  },

  /**
   * Détermine la route de redirection selon le rôle de l'utilisateur
   * 
   * Utilisé après login réussi pour rediriger vers le bon dashboard
   * 
   * @param {string} role - Rôle de l'utilisateur ('agent' | 'admin' | 'citizen')
   * @returns {string} Path de redirection
   * 
   * Exemple :
   * getRedirectPath('agent') → '/agent/dashboard'
   * getRedirectPath('admin') → '/admin/dashboard'
   * getRedirectPath('citizen') → '/home'
   */
  getRedirectPath(role) {
    const redirectPaths = {
      agent: '/agent/dashboard',
      admin: '/admin/dashboard',
      citizen: '/home',
    };

    return redirectPaths[role] || '/home'; // Fallback vers home si rôle inconnu
  },

  /**
   * Valide le format d'un email
   * 
   * @param {string} email - Email à valider
   * @returns {boolean} true si email valide
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valide la force d'un mot de passe
   * 
   * Règles :
   * - Minimum 6 caractères
   * 
   * @param {string} password - Mot de passe à valider
   * @returns {boolean} true si password valide
   */
  isValidPassword(password) {
    return password && password.length >= 6;
  },

  /**
   * Met à jour le profil de l'utilisateur actuel
   * 
   * Utilisé pour compléter le profil après OAuth (âge, commune)
   * 
   * @param {Object} updates - Champs à mettre à jour (age, commune_id, etc.)
   * @param {string} language - Langue pour les messages d'erreur
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   */
  async updateUserProfile(updates, language = 'fr') {
    try {
      // Récupérer la session active
      const session = await authApi.getSession();

      if (!session || !session.user) {
        return {
          success: false,
          error: language === 'fr'
            ? 'Vous devez être connecté pour mettre à jour votre profil'
            : 'Dafay wara dugg ngir jëmal sa profil',
        };
      }

      // Mettre à jour le profil
      const updatedProfile = await authApi.updateUserProfile(session.user.id, updates);

      return {
        success: true,
        user: {
          ...updatedProfile,
          email: session.user.email,
        },
      };

    } catch (error) {
      const secureMessage = getSecureErrorMessage(error, language);
      return {
        success: false,
        error: secureMessage,
      };
    }
  },
};

export default authService;

