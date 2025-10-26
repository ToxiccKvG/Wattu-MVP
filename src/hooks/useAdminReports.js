

import { useState, useEffect, useCallback } from 'react';
import * as reportApi from '@/api/reportApi';

/**
 * Hook pour gérer les signalements admin (TOUS signalements, toutes communes)
 * 
 * @param {Object} filters - Filtres à appliquer (commune_ids, types, statuses, priority, date_from, date_to)
 * @returns {Object} - { reports, loading, error, refetch, updateStatus, updatePriority }
 * 
 * @example
 * const { reports, loading, refetch } = useAdminReports({ 
 *   commune_ids: ['uuid-dakar', 'uuid-stlouis'],
 *   statuses: ['pending', 'in_progress']
 * });
 */
export function useAdminReports(filters = {}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Récupérer tous les signalements avec filtres
   */
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await reportApi.getAdminReports(filters);

      if (fetchError) {
        console.error('❌ Erreur récupération signalements admin:', fetchError);
        setError(fetchError.message || 'Erreur lors de la récupération');
        setReports([]);
      } else {
        setReports(data || []);
        console.log(`✅ ${data?.length || 0} signalements récupérés`);
      }
    } catch (err) {
      console.error('❌ Erreur inattendue useAdminReports:', err);
      setError('Une erreur inattendue est survenue');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters.commune_ids, filters.types, filters.statuses, filters.priority, filters.date_from, filters.date_to]);

  /**
   * Mettre à jour le statut d'un signalement
   * 
   * @param {string} reportId - UUID du signalement
   * @param {string} newStatus - Nouveau statut
   * @returns {Promise<{success: boolean, error: Object|null}>}
   */
  const updateStatus = async (reportId, newStatus) => {
    try {
      console.log(`🔄 Mise à jour statut: ${reportId} → ${newStatus}`);

      const { data, error: updateError } = await reportApi.updateReportStatus(reportId, newStatus);

      if (updateError) {
        console.error('❌ Erreur mise à jour statut:', updateError);
        return { success: false, error: updateError };
      }

      // Mettre à jour localement (optimistic UI)
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      console.log('✅ Statut mis à jour avec succès');
      return { success: true, error: null };

    } catch (err) {
      console.error('❌ Erreur inattendue updateStatus:', err);
      return { success: false, error: { message: 'Erreur inattendue' } };
    }
  };

  /**
   * Mettre à jour la priorité d'un signalement
   * 
   * @param {string} reportId - UUID du signalement
   * @param {string} newPriority - Nouvelle priorité
   * @returns {Promise<{success: boolean, error: Object|null}>}
   */
  const updatePriority = async (reportId, newPriority) => {
    try {
      console.log(`🔄 Mise à jour priorité: ${reportId} → ${newPriority}`);

      const { data, error: updateError } = await reportApi.updateReportPriority(reportId, newPriority);

      if (updateError) {
        console.error('❌ Erreur mise à jour priorité:', updateError);
        return { success: false, error: updateError };
      }

      // Mettre à jour localement (optimistic UI)
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, priority: newPriority } : report
        )
      );

      console.log('✅ Priorité mise à jour avec succès');
      return { success: true, error: null };

    } catch (err) {
      console.error('❌ Erreur inattendue updatePriority:', err);
      return { success: false, error: { message: 'Erreur inattendue' } };
    }
  };

  // Fetch initial et à chaque changement de filtres
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    updateStatus,
    updatePriority
  };
}

export default useAdminReports;

