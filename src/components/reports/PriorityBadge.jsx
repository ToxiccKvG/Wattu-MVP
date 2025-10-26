
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

/**
 * Badge coloré pour afficher la priorité d'un signalement
 * 
 * Couleurs :
 * - low (faible) → Gris (neutral)
 * - normal → Bleu (primary)
 * - high (élevée) → Orange (warning)
 * - urgent → Rouge (error)
 * 
 * @param {Object} props
 * @param {string} props.priority - Priorité du signalement (low, normal, high, urgent)
 * @param {string} [props.className] - Classes CSS additionnelles
 * 
 * @example
 * <PriorityBadge priority="normal" />
 * <PriorityBadge priority="urgent" className="ml-2" />
 */
function PriorityBadge({ priority, className = '' }) {
  const { t } = useTranslation('common');

  /**
   * Configuration des couleurs et labels par priorité
   */
  const priorityConfig = {
    low: {
      label: t('priority.low', { defaultValue: 'Faible' }),
      color: 'bg-neutral-100 text-neutral-700 border-neutral-300'
    },
    normal: {
      label: t('priority.normal', { defaultValue: 'Normal' }),
      color: 'bg-primary-100 text-primary-800 border-primary-300'
    },
    high: {
      label: t('priority.high', { defaultValue: 'Élevée' }),
      color: 'bg-warning-100 text-warning-800 border-warning-300'
    },
    urgent: {
      label: t('priority.urgent', { defaultValue: 'Urgent' }),
      color: 'bg-error-100 text-error-800 border-error-300'
    }
  };

  // Priorité par défaut si invalide
  const config = priorityConfig[priority] || priorityConfig.normal;

  return (
    <Badge className={`${config.color} border font-medium ${className}`}>
      {config.label}
    </Badge>
  );
}

export default PriorityBadge;

