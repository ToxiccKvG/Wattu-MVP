
import { supabase } from '@/config/supabase';

/**
 * API Layer pour les signalements (reports)
 * 
 * Interactions directes avec Supabase :
 * - CREATE : Créer un nouveau signalement (sans code_suivi pour MVP)
 * - GET ALL : Récupérer tous les signalements publics
 * - GET BY ID : Récupérer un signalement spécifique
 * - GET BY COMMUNE : Récupérer les signalements d'une commune
 * 
 * Note : Pas de logique métier ici, juste les appels Supabase
 */

/**
 * Créer un nouveau signalement
 * 
 * @param {Object} reportData - Données du signalement
 * @param {string} reportData.type - Type de signalement (OBLIGATOIRE)
 * @param {number} reportData.latitude - Latitude GPS (OBLIGATOIRE, -90 à 90)
 * @param {number} reportData.longitude - Longitude GPS (OBLIGATOIRE, -180 à 180)
 * @param {string} [reportData.description] - Description du problème
 * @param {string} [reportData.image_url] - URL de l'image uploadée
 * @param {string} [reportData.audio_url] - URL de l'audio (future feature)
 * @param {string} [reportData.phone] - Numéro de téléphone du citoyen
 * @param {string} [reportData.citizen_name] - Nom du citoyen
 * @param {string} [reportData.commune_id] - ID de la commune (UUID)
 * 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 * 
 * @example
 * const result = await createReport({
 *   type: 'voirie',
 *   description: 'Nid de poule sur Avenue Bourguiba',
 *   latitude: 14.6928,
 *   longitude: -17.4467,
 *   commune_id: 'uuid-dakar',
 *   phone: '+221771234567',
 *   citizen_name: 'Amadou Diallo',
 *   image_url: 'https://...storage.../photo.jpg'
 * });
 */
export async function createReport(reportData) {
  try {
    // Validation basique (la vraie validation se fait dans le Service Layer)
    if (!reportData.type || !reportData.latitude || !reportData.longitude) {
      return {
        data: null,
        error: {
          message: 'Type, latitude et longitude sont obligatoires',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      };
    }

    // Insertion dans la table reports
    // Note : status='pending' et priority='normal' sont auto-définis par la DB
    // Note : code_suivi reste NULL pour le MVP (pas de tracking)
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          type: reportData.type,
          description: reportData.description || null,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          commune_id: reportData.commune_id || null,
          image_url: reportData.image_url || null,
          audio_url: reportData.audio_url || null,
          phone: reportData.phone || null,
          citizen_name: reportData.citizen_name || null,
          // status et priority sont auto-définis (default DB)
          // code_suivi reste NULL (pas de tracking pour MVP)
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création signalement:', error);
      return { data: null, error };
    }

    console.log('✅ Signalement créé:', data.id);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue createReport:', err);
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
 * Récupérer tous les signalements publics
 * 
 * @param {Object} [options] - Options de filtrage
 * @param {string} [options.status] - Filtrer par statut (pending, in_progress, resolved, rejected)
 * @param {string} [options.type] - Filtrer par type (road, lighting, water, waste, security, other)
 * @param {string} [options.priority] - Filtrer par priorité (low, normal, high, urgent)
 * @param {string} [options.commune_id] - Filtrer par commune (UUID)
 * @param {number} [options.limit] - Limite du nombre de résultats (default: 100)
 * @param {string} [options.orderBy] - Tri (default: 'created_at')
 * @param {boolean} [options.ascending] - Ordre croissant (default: false = DESC)
 * 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * // Tous les signalements récents
 * const result = await getAllReports();
 * 
 * // Signalements en attente de Dakar
 * const result = await getAllReports({ 
 *   status: 'pending', 
 *   commune_id: 'uuid-dakar' 
 * });
 * 
 * // Signalements urgents de type voirie
 * const result = await getAllReports({ 
 *   type: 'road',
 *   priority: 'urgent',
 *   commune_id: 'uuid-dakar' 
 * });
 */
export async function getAllReports(options = {}) {
  try {
    const {
      status,
      type,
      priority,
      commune_id,
      limit = 100,
      orderBy = 'created_at',
      ascending = false
    } = options;

    let query = supabase
      .from('reports')
      .select(`
        *,
        commune:commune_id (
          id,
          name,
          region
        )
      `)
      .limit(limit)
      .order(orderBy, { ascending });

    // Filtres optionnels
    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (commune_id) {
      query = query.eq('commune_id', commune_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération signalements:', error);
      return { data: null, error };
    }

    console.log(`✅ ${data.length} signalements récupérés`);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue getAllReports:', err);
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
 * Récupérer un signalement spécifique par son ID
 * 
 * @param {string} id - UUID du signalement
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 * 
 * @example
 * const result = await getReportById('uuid-report');
 */
export async function getReportById(id) {
  try {
    if (!id) {
      return {
        data: null,
        error: {
          message: 'ID du signalement requis',
          code: 'MISSING_ID'
        }
      };
    }

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        commune:commune_id (
          id,
          name,
          region
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erreur récupération signalement:', error);
      return { data: null, error };
    }

    console.log('✅ Signalement récupéré:', data.id);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue getReportById:', err);
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
 * Récupérer les signalements d'une commune spécifique
 * 
 * @param {string} communeId - UUID de la commune
 * @param {Object} [options] - Options de filtrage
 * @param {string} [options.status] - Filtrer par statut
 * @param {number} [options.limit] - Limite du nombre de résultats (default: 100)
 * 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * const result = await getReportsByCommune('uuid-dakar', { status: 'pending' });
 */
export async function getReportsByCommune(communeId, options = {}) {
  try {
    if (!communeId) {
      return {
        data: null,
        error: {
          message: 'ID de la commune requis',
          code: 'MISSING_COMMUNE_ID'
        }
      };
    }

    return await getAllReports({
      ...options,
      commune_id: communeId
    });

  } catch (err) {
    console.error('❌ Erreur inattendue getReportsByCommune:', err);
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
 * Compter le nombre total de signalements
 * 
 * @param {Object} [filters] - Filtres optionnels
 * @param {string} [filters.status] - Filtrer par statut
 * @param {string} [filters.commune_id] - Filtrer par commune
 * 
 * @returns {Promise<{count: number|null, error: Object|null}>}
 * 
 * @example
 * const result = await getReportsCount({ status: 'pending' });
 */
export async function getReportsCount(filters = {}) {
  try {
    let query = supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.commune_id) {
      query = query.eq('commune_id', filters.commune_id);
    }

    const { count, error } = await query;

    if (error) {
      console.error('❌ Erreur comptage signalements:', error);
      return { count: null, error };
    }

    console.log(`✅ Nombre de signalements: ${count}`);
    return { count, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue getReportsCount:', err);
    return {
      count: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Mettre à jour le statut d'un signalement (AGENT/ADMIN uniquement)
 * 
 * @param {string} reportId - UUID du signalement
 * @param {string} newStatus - Nouveau statut (pending, in_progress, resolved, rejected)
 * 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 * 
 * @example
 * // Agent change statut de "pending" à "in_progress"
 * const result = await updateReportStatus('uuid-report', 'in_progress');
 * 
 * @security
 * - RLS Policy vérifie que l'agent modifie SEULEMENT sa commune
 * - Admin peut modifier tous les signalements
 */
export async function updateReportStatus(reportId, newStatus) {
  try {
    // Validation basique
    if (!reportId) {
      return {
        data: null,
        error: {
          message: 'ID du signalement requis',
          code: 'MISSING_REPORT_ID'
        }
      };
    }

    if (!newStatus) {
      return {
        data: null,
        error: {
          message: 'Nouveau statut requis',
          code: 'MISSING_STATUS'
        }
      };
    }

    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      return {
        data: null,
        error: {
          message: `Statut invalide. Valeurs autorisées: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        }
      };
    }

    // Mise à jour du statut + updated_at
    const { data, error } = await supabase
      .from('reports')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      return { data: null, error };
    }

    console.log(`✅ Statut mis à jour: ${reportId} → ${newStatus}`);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue updateReportStatus:', err);
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
 * Mettre à jour la priorité d'un signalement (AGENT/ADMIN uniquement)
 * 
 * @param {string} reportId - UUID du signalement
 * @param {string} newPriority - Nouvelle priorité (low, normal, high, urgent)
 * 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 * 
 * @example
 * // Agent évalue un signalement comme urgent
 * const result = await updateReportPriority('uuid-report', 'urgent');
 * 
 * @security
 * - RLS Policy vérifie que l'agent modifie SEULEMENT sa commune
 * - Admin peut modifier tous les signalements
 */
export async function updateReportPriority(reportId, newPriority) {
  try {
    // Validation basique
    if (!reportId) {
      return {
        data: null,
        error: {
          message: 'ID du signalement requis',
          code: 'MISSING_REPORT_ID'
        }
      };
    }

    if (!newPriority) {
      return {
        data: null,
        error: {
          message: 'Nouvelle priorité requise',
          code: 'MISSING_PRIORITY'
        }
      };
    }

    // Vérifier que la priorité est valide
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(newPriority)) {
      return {
        data: null,
        error: {
          message: `Priorité invalide. Valeurs autorisées: ${validPriorities.join(', ')}`,
          code: 'INVALID_PRIORITY'
        }
      };
    }

    // Mise à jour de la priorité + updated_at
    const { data, error } = await supabase
      .from('reports')
      .update({ 
        priority: newPriority,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour priorité:', error);
      return { data: null, error };
    }

    console.log(`✅ Priorité mise à jour: ${reportId} → ${newPriority}`);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue updateReportPriority:', err);
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
 * ═══════════════════════════════════════════════════════════
 * ADMIN-SPECIFIC FUNCTIONS
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Récupérer TOUS les signalements (ADMIN uniquement)
 * 
 * @param {Object} [options] - Options de filtrage avancées
 * @param {Array<string>} [options.commune_ids] - Filtrer par plusieurs communes (UUID array)
 * @param {Array<string>} [options.types] - Filtrer par plusieurs types (array)
 * @param {Array<string>} [options.statuses] - Filtrer par plusieurs statuts (array)
 * @param {string} [options.priority] - Filtrer par priorité (single)
 * @param {string} [options.date_from] - Date de début (ISO string)
 * @param {string} [options.date_to] - Date de fin (ISO string)
 * @param {number} [options.limit] - Limite du nombre de résultats (default: 1000)
 * @param {string} [options.orderBy] - Tri (default: 'created_at')
 * @param {boolean} [options.ascending] - Ordre croissant (default: false = DESC)
 * 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @example
 * // Tous les signalements
 * const result = await getAdminReports();
 * 
 * // Signalements de Dakar et Saint-Louis, type voirie, urgents
 * const result = await getAdminReports({ 
 *   commune_ids: ['uuid-dakar', 'uuid-stlouis'],
 *   types: ['road'],
 *   statuses: ['pending', 'in_progress'],
 *   priority: 'urgent'
 * });
 * 
 * @security
 * - RLS Policy vérifie que l'utilisateur est admin
 * - Accès TOUS les signalements (toutes communes)
 */
export async function getAdminReports(options = {}) {
  try {
    const {
      commune_ids,
      types,
      statuses,
      priority,
      date_from,
      date_to,
      limit = 1000,
      orderBy = 'created_at',
      ascending = false
    } = options;

    let query = supabase
      .from('reports')
      .select(`
        *,
        commune:commune_id (
          id,
          name,
          region
        )
      `)
      .limit(limit)
      .order(orderBy, { ascending });

    // Filtres optionnels

    // Multi-commune filtering
    if (commune_ids && commune_ids.length > 0) {
      query = query.in('commune_id', commune_ids);
    }

    // Multi-type filtering
    if (types && types.length > 0) {
      query = query.in('type', types);
    }

    // Multi-status filtering
    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses);
    }

    // Single priority filtering
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Date range filtering
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération signalements admin:', error);
      return { data: null, error };
    }

    console.log(`✅ Admin: ${data.length} signalements récupérés`);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue getAdminReports:', err);
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
 * Récupérer les statistiques globales du système (ADMIN uniquement)
 * 
 * @returns {Promise<{stats: Object|null, error: Object|null}>}
 * 
 * @returns stats.total - Total de tous les signalements
 * @returns stats.pending - Signalements en attente
 * @returns stats.in_progress - Signalements en cours
 * @returns stats.resolved - Signalements résolus
 * @returns stats.rejected - Signalements rejetés
 * @returns stats.by_priority - Répartition par priorité { low, normal, high, urgent }
 * 
 * @example
 * const { stats, error } = await getGlobalStatistics();
 * // stats = { total: 156, pending: 34, in_progress: 28, resolved: 89, rejected: 5, by_priority: {...} }
 * 
 * @security
 * - RLS Policy vérifie que l'utilisateur est admin
 */
export async function getGlobalStatistics() {
  try {
    // Récupérer TOUS les signalements (RLS vérifiera admin)
    const { data: allReports, error } = await supabase
      .from('reports')
      .select('status, priority');

    if (error) {
      console.error('❌ Erreur récupération stats globales:', error);
      return { stats: null, error };
    }

    // Calculer les stats
    const stats = {
      total: allReports.length,
      pending: allReports.filter(r => r.status === 'pending').length,
      in_progress: allReports.filter(r => r.status === 'in_progress').length,
      resolved: allReports.filter(r => r.status === 'resolved').length,
      rejected: allReports.filter(r => r.status === 'rejected').length,
      by_priority: {
        low: allReports.filter(r => r.priority === 'low').length,
        normal: allReports.filter(r => r.priority === 'normal').length,
        high: allReports.filter(r => r.priority === 'high').length,
        urgent: allReports.filter(r => r.priority === 'urgent').length,
      }
    };

    console.log('✅ Stats globales récupérées:', stats);
    return { stats, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue getGlobalStatistics:', err);
    return {
      stats: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Récupérer le classement des communes par volume de signalements (ADMIN uniquement)
 * 
 * @param {number} [limit=5] - Nombre de communes à retourner (default: 5)
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 * 
 * @returns data[] - Array de communes classées
 * @returns data[].commune_id - UUID de la commune
 * @returns data[].commune_name - Nom de la commune
 * @returns data[].commune_region - Région de la commune
 * @returns data[].total_reports - Nombre total de signalements
 * @returns data[].pending - Nombre de signalements en attente
 * @returns data[].in_progress - Nombre de signalements en cours
 * @returns data[].resolved - Nombre de signalements résolus
 * @returns data[].rejected - Nombre de signalements rejetés
 * 
 * @example
 * const { data, error } = await getTopCommunes(5);
 * // data = [
 * //   { commune_name: 'Dakar', total_reports: 68, pending: 12, ... },
 * //   { commune_name: 'Saint-Louis', total_reports: 45, pending: 8, ... },
 * //   ...
 * // ]
 * 
 * @security
 * - RLS Policy vérifie que l'utilisateur est admin
 */
export async function getTopCommunes(limit = 5) {
  try {
    // Récupérer TOUS les signalements avec info commune (RLS vérifiera admin)
    const { data: allReports, error } = await supabase
      .from('reports')
      .select(`
        commune_id,
        status,
        commune:commune_id (
          id,
          name,
          region
        )
      `);

    if (error) {
      console.error('❌ Erreur récupération top communes:', error);
      return { data: null, error };
    }

    // Grouper par commune et calculer stats
    const communeStatsMap = {};

    allReports.forEach(report => {
      const communeId = report.commune_id;
      const communeName = report.commune?.name || 'Inconnu';
      const communeRegion = report.commune?.region || 'Inconnu';

      if (!communeStatsMap[communeId]) {
        communeStatsMap[communeId] = {
          commune_id: communeId,
          commune_name: communeName,
          commune_region: communeRegion,
          total_reports: 0,
          pending: 0,
          in_progress: 0,
          resolved: 0,
          rejected: 0
        };
      }

      communeStatsMap[communeId].total_reports++;

      // Compter par statut
      if (report.status === 'pending') communeStatsMap[communeId].pending++;
      else if (report.status === 'in_progress') communeStatsMap[communeId].in_progress++;
      else if (report.status === 'resolved') communeStatsMap[communeId].resolved++;
      else if (report.status === 'rejected') communeStatsMap[communeId].rejected++;
    });

    // Convertir en array et trier par total_reports (DESC)
    const topCommunes = Object.values(communeStatsMap)
      .sort((a, b) => b.total_reports - a.total_reports)
      .slice(0, limit);

    console.log(`✅ Top ${limit} communes récupérées:`, topCommunes);
    return { data: topCommunes, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue getTopCommunes:', err);
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
  createReport,
  getAllReports,
  getReportById,
  getReportsByCommune,
  getReportsCount,
  updateReportStatus,
  updateReportPriority,
  getAdminReports,
  getGlobalStatistics,
  getTopCommunes
};

