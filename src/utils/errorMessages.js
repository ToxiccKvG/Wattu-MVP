

/**
 * Centralisation des messages d'erreur
 * 
 * Rôle : Transformer les erreurs techniques (Supabase, réseau, etc.)
 * en messages utilisateur sécurisés et compréhensibles
 * 
 * Sécurité : Ne JAMAIS exposer les détails techniques aux utilisateurs
 * (évite les fuites d'infos qui pourraient aider au hacking)
 */

/**
 * Mapping des erreurs d'authentification Supabase
 * Structure : { "Erreur Supabase": { fr: "Message FR", wo: "Message Wolof" } }
 */
export const authErrorMessages = {
  // Erreur de credentials invalides
  'Invalid login credentials': {
    fr: 'Email ou mot de passe incorrect',
    wo: 'Email walla mot de passe dañu xamul',
  },
  
  // User introuvable (on donne le MÊME message que credentials invalides pour la sécurité)
  'User not found': {
    fr: 'Email ou mot de passe incorrect',
    wo: 'Email walla mot de passe dañu xamul',
  },
  
  // Email non confirmé
  'Email not confirmed': {
    fr: 'Veuillez confirmer votre email avant de vous connecter',
    wo: 'Dafay wara confirmer sa email balaa dugge',
  },
  
  // Session expirée (JWT invalide)
  'Invalid JWT': {
    fr: 'Votre session a expiré. Veuillez vous reconnecter',
    wo: 'Sa session a expiré. Dafay wara dugg bu bees',
  },
  
  'JWT expired': {
    fr: 'Votre session a expiré. Veuillez vous reconnecter',
    wo: 'Sa session a expiré. Dafay wara dugg bu bees',
  },
  
  // Trop de tentatives de connexion
  'Too many requests': {
    fr: 'Trop de tentatives. Veuillez réessayer dans quelques minutes',
    wo: 'Yàgg na lool. Jéematul ci ay simili',
  },
  
  // Erreur réseau
  'Network request failed': {
    fr: 'Erreur de connexion. Vérifiez votre connexion internet',
    wo: 'Erreur connexion. Xoolal sa internet',
  },
  
  'Failed to fetch': {
    fr: 'Erreur de connexion. Vérifiez votre connexion internet',
    wo: 'Erreur connexion. Xoolal sa internet',
  },
};

/**
 * Messages d'erreur génériques (fallback si erreur inconnue)
 */
export const genericErrorMessages = {
  fr: 'Une erreur est survenue. Veuillez réessayer',
  wo: 'Am na ci njumte. Jéematul',
};

/**
 * Fonction pour obtenir un message d'erreur sécurisé
 * 
 * @param {Error|string} error - Erreur Supabase ou message d'erreur
 * @param {string} language - Langue ('fr' | 'wo')
 * @returns {string} Message d'erreur sécurisé dans la langue demandée
 * 
 * Comportement :
 * 1. Cherche dans authErrorMessages si message connu
 * 2. Sinon, retourne message générique (ultra sécurisé)
 * 3. Log l'erreur technique en console (pour debug développeur)
 */
export function getSecureErrorMessage(error, language = 'fr') {
  // Extraire le message de l'erreur
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  // Log technique (visible uniquement en développement)
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Erreur technique (ne pas afficher à l\'user):', error);
  }
  
  // Chercher dans le mapping
  if (authErrorMessages[errorMessage]) {
    return authErrorMessages[errorMessage][language] || authErrorMessages[errorMessage].fr;
  }
  
  // Si erreur inconnue, retourner message générique
  return genericErrorMessages[language] || genericErrorMessages.fr;
}

/**
 * Fonction pour obtenir un message d'erreur de validation
 * (utilisé pour validation de formulaires côté client)
 */
export const validationErrorMessages = {
  emailRequired: {
    fr: 'L\'email est obligatoire',
    wo: 'Email a obligatoire',
  },
  
  emailInvalid: {
    fr: 'L\'email n\'est pas valide',
    wo: 'Email bi xamuñu ko',
  },
  
  passwordRequired: {
    fr: 'Le mot de passe est obligatoire',
    wo: 'Mot de passe a obligatoire',
  },
  
  passwordTooShort: {
    fr: 'Le mot de passe doit contenir au moins 6 caractères',
    wo: 'Mot de passe bi dafay wara am 6 caractères',
  },
};

/**
 * Fonction helper pour obtenir un message de validation
 * 
 * @param {string} key - Clé du message (ex: 'emailRequired')
 * @param {string} language - Langue ('fr' | 'wo')
 * @returns {string} Message de validation
 */
export function getValidationMessage(key, language = 'fr') {
  if (validationErrorMessages[key]) {
    return validationErrorMessages[key][language] || validationErrorMessages[key].fr;
  }
  return genericErrorMessages[language];
}

export default {
  authErrorMessages,
  genericErrorMessages,
  validationErrorMessages,
  getSecureErrorMessage,
  getValidationMessage,
};

