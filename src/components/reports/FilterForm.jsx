
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

/**
 * Formulaire de filtres pour la liste des signalements
 * 
 * Filtres disponibles :
 * - Type de signalement
 * - Statut
 * - Priorité
 * 
 * @param {Object} props
 * @param {Object} props.filters - État actuel des filtres
 * @param {Function} props.onFilterChange - Callback quand un filtre change
 * @param {Function} props.onReset - Callback pour réinitialiser les filtres
 * @param {number} [props.activeFiltersCount] - Nombre de filtres actifs
 * @param {string} [props.className] - Classes CSS additionnelles
 * 
 * @example
 * const { filters, setFilter, resetFilters, activeFiltersCount } = useReportFilters();
 * 
 * <FilterForm
 *   filters={filters}
 *   onFilterChange={setFilter}
 *   onReset={resetFilters}
 *   activeFiltersCount={activeFiltersCount}
 * />
 */
function FilterForm({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount = 0,
  className = ''
}) {
  const { t } = useTranslation('common');

  /**
   * Types de signalements disponibles
   */
  const reportTypes = [
    { value: 'voirie', label: 'Voirie' },
    { value: 'eclairage', label: 'Éclairage public' },
    { value: 'eau', label: 'Eau' },
    { value: 'dechets', label: 'Déchets/Salubrité' },
    { value: 'securite', label: 'Sécurité' },
    { value: 'espaces_verts', label: 'Espaces verts' },
    { value: 'assainissement', label: 'Assainissement' },
    { value: 'transport', label: 'Transport' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-4 space-y-4 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8"
          >
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Grille de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtre Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Type
          </label>
          <Select
            value={filters.type || ''}
            onValueChange={(value) => onFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.type && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange('type', '')}
              className="w-full h-8 text-xs"
            >
              Effacer
            </Button>
          )}
        </div>

        {/* Filtre Statut */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Statut
          </label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                {t('status.pending', { defaultValue: 'En attente' })}
              </SelectItem>
              <SelectItem value="in_progress">
                {t('status.in_progress', { defaultValue: 'En cours' })}
              </SelectItem>
              <SelectItem value="resolved">
                {t('status.resolved', { defaultValue: 'Résolu' })}
              </SelectItem>
              <SelectItem value="rejected">
                {t('status.rejected', { defaultValue: 'Rejeté' })}
              </SelectItem>
            </SelectContent>
          </Select>
          {filters.status && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange('status', '')}
              className="w-full h-8 text-xs"
            >
              Effacer
            </Button>
          )}
        </div>

        {/* Filtre Priorité */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Priorité
          </label>
          <Select
            value={filters.priority || ''}
            onValueChange={(value) => onFilterChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les priorités" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">
                🔴 {t('priority.urgent', { defaultValue: 'Urgent' })}
              </SelectItem>
              <SelectItem value="high">
                🟠 {t('priority.high', { defaultValue: 'Élevée' })}
              </SelectItem>
              <SelectItem value="normal">
                🔵 {t('priority.normal', { defaultValue: 'Normal' })}
              </SelectItem>
              <SelectItem value="low">
                ⚪ {t('priority.low', { defaultValue: 'Faible' })}
              </SelectItem>
            </SelectContent>
          </Select>
          {filters.priority && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange('priority', '')}
              className="w-full h-8 text-xs"
            >
              Effacer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterForm;

