
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

/**
 * Badge coloré pour afficher le statut d'un signalement
 * 
 * Couleurs :
 * - pending (en attente) → Jaune (warning)
 * - in_progress (en cours) → Bleu (primary)
 * - resolved (résolu) → Vert (success)
 * - rejected (rejeté) → Rouge (error)
 * 
 * @param {Object} props
 * @param {string} props.status - Statut du signalement (pending, in_progress, resolved, rejected)
 * @param {string} [props.className] - Classes CSS additionnelles
 * 
 * @example
 * <StatusBadge status="pending" />
 * <StatusBadge status="in_progress" className="ml-2" />
 */
function StatusBadge({ status, className = '' }) {
  const { t } = useTranslation('common');

  /**
   * Configuration des couleurs et labels par statut
   */
  const statusConfig = {
    pending: {
      label: t('status.pending', { defaultValue: 'En attente' }),
      color: 'bg-warning-100 text-warning-800 border-warning-300'
    },
    in_progress: {
      label: t('status.in_progress', { defaultValue: 'En cours' }),
      color: 'bg-primary-100 text-primary-800 border-primary-300'
    },
    resolved: {
      label: t('status.resolved', { defaultValue: 'Résolu' }),
      color: 'bg-success-100 text-success-800 border-success-300'
    },
    rejected: {
      label: t('status.rejected', { defaultValue: 'Rejeté' }),
      color: 'bg-error-100 text-error-800 border-error-300'
    }
  };

  // Statut par défaut si invalide
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge className={`${config.color} border font-medium ${className}`}>
      {config.label}
    </Badge>
  );
}

export default StatusBadge;

