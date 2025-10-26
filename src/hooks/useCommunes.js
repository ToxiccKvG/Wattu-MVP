
import { useState, useEffect, useCallback } from 'react';
import * as communeApi from '@/api/communeApi';

/**
 * Custom Hook pour la gestion des communes
 * 
 * Fonctionnalités :
 * - Récupérer toutes les communes au montage
 * - Filtrer par région
 * - Rechercher par nom
 * - Récupérer une commune spécifique par ID
 * - États de chargement et erreurs
 * 
 * @param {Object} [options] - Options du hook
 * @param {boolean} [options.autoFetch=true] - Récupérer automatiquement au montage
 * 
 * @returns {Object} État et fonctions communes
 * @property {Array} communes - Liste des communes
 * @property {boolean} loading - État de chargement
 * @property {Object|null} error - Erreur éventuelle
 * @property {function} fetchCommunes - Récupérer toutes les communes
 * @property {function} getCommuneById - Récupérer une commune par ID
 * @property {function} filterByRegion - Filtrer les communes par région
 * @property {function} searchCommunes - Rechercher des communes
 * @property {Array} regions - Liste unique des régions
 * 
 * @example
 * const { communes, loading, error, searchCommunes } = useCommunes();
 * 
 * {loading && <p>Chargement...</p>}
 * {error && <p>{error.message}</p>}
 * {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 */
export function useCommunes(options = {}) {
  const { autoFetch = true } = options;

  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupérer toutes les communes
   */
  const fetchCommunes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏙️ Récupération des communes...');

      const result = await communeApi.getAllCommunes();

      if (result.error) {
        setError(result.error);
        setCommunes([]);
        console.error('❌ Erreur récupération communes:', result.error);
        return;
      }

      setCommunes(result.data);
      console.log(`✅ ${result.data.length} communes récupérées`);

    } catch (err) {
      const errorObj = {
        code: 'FETCH_ERROR',
        message: err.message || 'Erreur lors de la récupération des communes'
      };
      setError(errorObj);
      setCommunes([]);
      console.error('❌ Erreur inattendue fetchCommunes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer une commune spécifique par ID
   * 
   * @param {string} id - UUID de la commune
   * @returns {Promise<Object|null>}
   */
  const getCommuneById = useCallback(async (id) => {
    try {
      console.log(`🏙️ Récupération de la commune ${id}...`);

      const result = await communeApi.getCommuneById(id);

      if (result.error) {
        console.error('❌ Erreur récupération commune:', result.error);
        return null;
      }

      console.log(`✅ Commune récupérée: ${result.data.name}`);
      return result.data;

    } catch (err) {
      console.error('❌ Erreur inattendue getCommuneById:', err);
      return null;
    }
  }, []);

  /**
   * Filtrer les communes par région
   * 
   * @param {string} region - Nom de la région
   * @returns {Array} Communes de la région
   */
  const filterByRegion = useCallback((region) => {
    if (!region || region.trim() === '') {
      return communes;
    }

    return communes.filter(c => c.region === region);
  }, [communes]);

  /**
   * Rechercher des communes par nom (local)
   * 
   * @param {string} searchTerm - Terme de recherche
   * @returns {Array} Communes correspondantes
   */
  const searchCommunes = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return communes;
    }

    const term = searchTerm.toLowerCase();
    return communes.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.region.toLowerCase().includes(term)
    );
  }, [communes]);

  /**
   * Obtenir la liste unique des régions
   * 
   * @returns {Array<string>}
   */
  const getRegions = useCallback(() => {
    const uniqueRegions = [...new Set(communes.map(c => c.region))];
    return uniqueRegions.sort();
  }, [communes]);

  /**
   * Trouver une commune par nom
   * 
   * @param {string} name - Nom de la commune
   * @returns {Object|null}
   */
  const findCommuneByName = useCallback((name) => {
    return communes.find(c => c.name === name) || null;
  }, [communes]);

  /**
   * Vérifier si une commune existe par ID
   * 
   * @param {string} id - UUID de la commune
   * @returns {boolean}
   */
  const communeExists = useCallback((id) => {
    return communes.some(c => c.id === id);
  }, [communes]);

  // Auto-fetch au montage si activé
  useEffect(() => {
    if (autoFetch) {
      fetchCommunes();
    }
  }, [autoFetch, fetchCommunes]);

  return {
    communes,
    loading,
    error,
    fetchCommunes,
    getCommuneById,
    filterByRegion,
    searchCommunes,
    regions: getRegions(),
    findCommuneByName,
    communeExists
  };
}

export default useCommunes;

