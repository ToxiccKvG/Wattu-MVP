
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook pour la géolocalisation GPS
 * 
 * Fonctionnalités :
 * - Récupérer la position GPS actuelle
 * - Gérer les permissions (granted, denied, prompt)
 * - Gérer les erreurs (permission refusée, timeout, GPS indisponible)
 * - États de chargement
 * 
 * @returns {Object} État de géolocalisation
 * @property {Object|null} position - Position GPS {latitude, longitude, accuracy}
 * @property {boolean} loading - État de chargement
 * @property {Object|null} error - Erreur éventuelle
 * @property {function} getCurrentPosition - Fonction pour récupérer la position
 * @property {function} clearPosition - Fonction pour réinitialiser la position
 * @property {boolean} isSupported - true si la géolocalisation est supportée
 * 
 * @example
 * const { position, loading, error, getCurrentPosition } = useGeolocation();
 * 
 * // Récupérer la position au clic
 * <button onClick={getCurrentPosition}>
 *   {loading ? 'Chargement...' : 'Obtenir ma position'}
 * </button>
 * 
 * {error && <p>{error.message}</p>}
 * {position && <p>Lat: {position.latitude}, Lon: {position.longitude}</p>}
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Vérifier si la géolocalisation est supportée
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError({
        code: 'NOT_SUPPORTED',
        message: 'La géolocalisation n\'est pas supportée par ce navigateur'
      });
    }
  }, []);

  /**
   * Récupérer la position GPS actuelle
   * 
   * @param {Object} [options] - Options de géolocalisation
   * @param {boolean} [options.enableHighAccuracy=true] - Haute précision
   * @param {number} [options.timeout=10000] - Timeout en ms (default: 10s)
   * @param {number} [options.maximumAge=0] - Âge maximum de la position en cache
   * 
   * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
   */
  const getCurrentPosition = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const notSupportedError = {
          code: 'NOT_SUPPORTED',
          message: 'La géolocalisation n\'est pas supportée'
        };
        setError(notSupportedError);
        reject(notSupportedError);
        return;
      }

      setLoading(true);
      setError(null);

      const defaultOptions = {
        enableHighAccuracy: true,  // Haute précision (utilise GPS si disponible)
        timeout: 10000,             // Timeout de 10 secondes
        maximumAge: 0               // Ne pas utiliser une position en cache
      };

      const geoOptions = { ...defaultOptions, ...options };

      console.log('📍 Demande de géolocalisation en cours...');

      navigator.geolocation.getCurrentPosition(
        // Success callback
        (geoPosition) => {
          const pos = {
            latitude: geoPosition.coords.latitude,
            longitude: geoPosition.coords.longitude,
            accuracy: geoPosition.coords.accuracy
          };

          console.log(`✅ Position obtenue: Lat ${pos.latitude}, Lon ${pos.longitude} (Précision: ${pos.accuracy}m)`);

          setPosition(pos);
          setLoading(false);
          setError(null);
          resolve(pos);
        },

        // Error callback
        (geoError) => {
          let errorMessage = 'Erreur de géolocalisation';
          let errorCode = 'UNKNOWN_ERROR';

          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.';
              errorCode = 'PERMISSION_DENIED';
              break;

            case geoError.POSITION_UNAVAILABLE:
              errorMessage = 'Position GPS indisponible. Vérifiez que le GPS est activé.';
              errorCode = 'POSITION_UNAVAILABLE';
              break;

            case geoError.TIMEOUT:
              errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
              errorCode = 'TIMEOUT';
              break;

            default:
              errorMessage = 'Une erreur est survenue lors de la géolocalisation';
              errorCode = 'UNKNOWN_ERROR';
          }

          console.error('❌ Erreur géolocalisation:', errorCode, errorMessage);

          const error = {
            code: errorCode,
            message: errorMessage,
            originalError: geoError
          };

          setError(error);
          setLoading(false);
          setPosition(null);
          reject(error);
        },

        // Options
        geoOptions
      );
    });
  }, [isSupported]);

  /**
   * Réinitialiser la position et l'erreur
   */
  const clearPosition = useCallback(() => {
    setPosition(null);
    setError(null);
    setLoading(false);
    console.log('🔄 Position réinitialisée');
  }, []);

  /**
   * Vérifier les permissions de géolocalisation
   * 
   * @returns {Promise<string>} 'granted', 'denied', ou 'prompt'
   */
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      // API Permissions non supportée (Safari iOS par exemple)
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      console.log('🔐 Permission géolocalisation:', result.state);
      return result.state; // 'granted', 'denied', ou 'prompt'
    } catch (err) {
      console.warn('⚠️ Impossible de vérifier les permissions:', err);
      return 'prompt';
    }
  }, []);

  return {
    position,
    loading,
    error,
    isSupported,
    getCurrentPosition,
    clearPosition,
    checkPermission
  };
}

export default useGeolocation;

