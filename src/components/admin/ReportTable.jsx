

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/reports/StatusBadge';
import PriorityBadge from '@/components/reports/PriorityBadge';
import Pagination from '@/components/shared/Pagination';
import { ArrowUpDown, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Composant Table de signalements (tri-able, pagination)
 * 
 * @param {Array} reports - Array de signalements
 * @param {boolean} loading - État de chargement
 * 
 * @example
 * <ReportTable reports={reports} loading={loading} />
 */
function ReportTable({ reports, loading }) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  // État tri
  const [sortBy, setSortBy] = useState('created_at'); // Colonne triée
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'

  // État pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  /**
   * Gérer le tri par colonne
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle ordre si même colonne
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne → ordre DESC par défaut
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset à page 1
  };

  /**
   * Trier les signalements
   */
  const sortedReports = useMemo(() => {
    if (!reports) return [];

    const sorted = [...reports].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Cas spécial: commune_name
      if (sortBy === 'commune_name') {
        aValue = a.commune?.name || '';
        bValue = b.commune?.name || '';
      }

      // Cas spécial: dates
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Comparaison
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [reports, sortBy, sortOrder]);

  /**
   * Paginer les signalements triés
   */
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedReports.slice(startIndex, endIndex);
  }, [sortedReports, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);

  /**
   * Formater la date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /**
   * Formater le type
   */
  const formatType = (type) => {
    const types = {
      'road': 'Voirie',
      'lighting': 'Éclairage',
      'water': 'Eau',
      'waste': 'Déchets',
      'security': 'Sécurité',
      'other': 'Autre'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">
          {t('report_table.no_reports', { defaultValue: 'Aucun signalement trouvé' })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Desktop */}
      <div className="hidden lg:block overflow-x-auto border border-blue-200/50 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50/50 border-b border-blue-200/50">
            <tr>
              {/* ID */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  ID
                  {sortBy === 'id' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </th>

              {/* Commune */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('commune_name')}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  Commune
                  {sortBy === 'commune_name' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </th>

              {/* Type */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  Type
                  {sortBy === 'type' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </th>

              {/* Statut */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  Statut
                  {sortBy === 'status' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </th>

              {/* Priorité */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  Priorité
                  {sortBy === 'priority' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </th>

              {/* Date */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  Date
                  {sortBy === 'created_at' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </th>

              {/* Actions */}
              <th className="px-4 py-3 text-right font-medium text-neutral-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedReports.map(report => (
              <tr key={report.id} className="bg-white hover:bg-blue-50/30 transition-colors">
                {/* ID */}
                <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                  {report.id.slice(0, 8)}
                </td>

                {/* Commune */}
                <td className="px-4 py-3 text-neutral-900 font-medium">
                  {report.commune?.name || 'Inconnu'}
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {formatType(report.type)}
                  </Badge>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>

                {/* Priorité */}
                <td className="px-4 py-3">
                  <PriorityBadge priority={report.priority} />
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-neutral-600">
                  {formatDate(report.created_at)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/reports/${report.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="lg:hidden space-y-3">
        {paginatedReports.map(report => (
          <div
            key={report.id}
            className="bg-white border border-blue-200/50 rounded-lg p-4 space-y-3 hover:bg-blue-50/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-neutral-900">{report.commune?.name || 'Inconnu'}</p>
                <p className="text-sm text-neutral-600">{formatType(report.type)}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <span className="text-xs text-neutral-500">{formatDate(report.created_at)}</span>
              <Button
                size="sm"
                onClick={() => navigate(`/admin/reports/${report.id}`)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Voir
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedReports.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

export default ReportTable;

