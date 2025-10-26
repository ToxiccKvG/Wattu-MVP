

import { useState, useEffect, useCallback } from 'react';
import * as reportApi from '@/api/reportApi';

/**
 * Hook pour récupérer les statistiques globales (ADMIN uniquement)
 * 
 * @returns {Object} - { stats, loading, error, refetch }
 * 
 * @example
 * const { stats, loading, refetch } = useGlobalStats();
 * // stats = { total: 156, pending: 34, in_progress: 28, resolved: 89, rejected: 5, by_priority: {...} }
 */
export function useGlobalStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Récupérer les statistiques globales
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { stats: data, error: fetchError } = await reportApi.getGlobalStatistics();

      if (fetchError) {
        console.error('❌ Erreur récupération stats globales:', fetchError);
        setError(fetchError.message || 'Erreur lors de la récupération');
        setStats(null);
      } else {
        setStats(data);
        console.log('✅ Stats globales récupérées:', data);
      }
    } catch (err) {
      console.error('❌ Erreur inattendue useGlobalStats:', err);
      setError('Une erreur inattendue est survenue');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export default useGlobalStats;

