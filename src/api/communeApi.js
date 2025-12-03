
import { supabase } from '@/config/supabase';

/**
 * API Layer pour les communes
 * 
 * Interactions directes avec Supabase :
 * - GET ALL : Récupérer toutes les communes
 * - GET BY ID : Récupérer une commune spécifique
 * - GET BY REGION : Récupérer les communes d'une région
 * 
 * Note : Les citoyens n'ont besoin que de la lecture (SELECT)
 * Les modifications sont réservées aux admins via l'interface admin
 */

/**
 * Récupérer toutes les communes
 * 
 * @param {Object} [options] - Options de tri
 * @param {string} [options.orderBy] - Colonne de tri (default: 'name')
 * @param {boolean} [options.ascending] - Ordre croissant (default: true)
 * 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * const result = await getAllCommunes();
 * // result.data = [
 * //   { id: 'uuid', name: 'Dakar', region: 'Dakar' },
 * //   { id: 'uuid', name: 'Saint-Louis', region: 'Saint-Louis' },
 * //   ...
 * // ]
 */
export async function getAllCommunes(options = {}) {
  try {
    const {
      orderBy = 'name',
      ascending = true
    } = options;

    const { data, error } = await supabase
      .from('communes')
      .select('id, name, region, created_at, updated_at')
      .order(orderBy, { ascending });

    if (error) {
      console.error(' Erreur récupération communes:', error);
      return { data: null, error };
    }

    console.log(`✅ ${data.length} communes récupérées`);
    return { data, error: null };

  } catch (err) {
    console.error(' Erreur inattendue getAllCommunes:', err);
    return {
      data: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Récupérer une commune spécifique par son ID
 * 
 * @param {string} id - UUID de la commune
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 * 
 * @example
 * const result = await getCommuneById('uuid-dakar');
 * // result.data = { id: 'uuid', name: 'Dakar', region: 'Dakar' }
 */
export async function getCommuneById(id) {
  try {
    if (!id) {
      return {
        data: null,
        error: {
          message: 'ID de la commune requis',
          code: 'MISSING_ID'
        }
      };
    }

    const { data, error } = await supabase
      .from('communes')
      .select('id, name, region, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      console.error(' Erreur récupération commune:', error);
      return { data: null, error };
    }

    console.log('Commune récupérée:', data.name);
    return { data, error: null };

  } catch (err) {
    console.error(' Erreur inattendue getCommuneById:', err);
    return {
      data: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Récupérer les communes d'une région spécifique
 * 
 * @param {string} region - Nom de la région
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * const result = await getCommunesByRegion('Dakar');
 * // result.data = [
 * //   { id: 'uuid', name: 'Dakar', region: 'Dakar' },
 * //   { id: 'uuid', name: 'Pikine', region: 'Dakar' },
 * //   ...
 * // ]
 */
export async function getCommunesByRegion(region) {
  try {
    if (!region) {
      return {
        data: null,
        error: {
          message: 'Nom de la région requis',
          code: 'MISSING_REGION'
        }
      };
    }

    const { data, error } = await supabase
      .from('communes')
      .select('id, name, region, created_at, updated_at')
      .eq('region', region)
      .order('name', { ascending: true });

    if (error) {
      console.error(' Erreur récupération communes par région:', error);
      return { data: null, error };
    }

    console.log(` ${data.length} communes récupérées pour la région ${region}`);
    return { data, error: null };

  } catch (err) {
    console.error('Erreur inattendue getCommunesByRegion:', err);
    return {
      data: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Récupérer la liste unique des régions
 * 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * const result = await getAllRegions();
 * // result.data = ['Dakar', 'Saint-Louis', 'Thiès']
 */
export async function getAllRegions() {
  try {
    // Récupérer toutes les communes puis extraire les régions uniques
    const { data: communes, error } = await getAllCommunes();

    if (error) {
      return { data: null, error };
    }

    // Extraire les régions uniques et les trier
    const regions = [...new Set(communes.map(c => c.region))].sort();

    console.log(` ${regions.length} régions trouvées`);
    return { data: regions, error: null };

  } catch (err) {
    console.error('Erreur inattendue getAllRegions:', err);
    return {
      data: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Rechercher des communes par nom (search)
 * 
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * const result = await searchCommunes('Dak');
 * // result.data = [{ id: 'uuid', name: 'Dakar', region: 'Dakar' }]
 */
export async function searchCommunes(searchTerm) {
  try {
    if (!searchTerm) {
      return {
        data: null,
        error: {
          message: 'Terme de recherche requis',
          code: 'MISSING_SEARCH_TERM'
        }
      };
    }

    const { data, error } = await supabase
      .from('communes')
      .select('id, name, region, created_at, updated_at')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error(' Erreur recherche communes:', error);
      return { data: null, error };
    }

    console.log(`${data.length} communes trouvées pour "${searchTerm}"`);
    return { data, error: null };

  } catch (err) {
    console.error(' Erreur inattendue searchCommunes:', err);
    return {
      data: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

export default {
  getAllCommunes,
  getCommuneById,
  getCommunesByRegion,
  getAllRegions,
  searchCommunes
};


