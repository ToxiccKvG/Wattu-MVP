
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StatusBadge from './StatusBadge';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Formulaire pour mettre à jour le statut d'un signalement
 * 
 * Fonctionnalités :
 * - Affiche le statut actuel (badge)
 * - Dropdown pour sélectionner le nouveau statut
 * - Validation des transitions autorisées
 * - Bouton de soumission
 * 
 * @param {Object} props
 * @param {string} props.currentStatus - Statut actuel du signalement
 * @param {Function} props.onSubmit - Callback à la soumission (newStatus)
 * @param {boolean} [props.loading] - Affiche un spinner pendant l'update
 * @param {string} [props.className] - Classes CSS additionnelles
 * 
 * @example
 * <StatusUpdateForm
 *   currentStatus="pending"
 *   onSubmit={(newStatus) => updateStatus(reportId, newStatus)}
 *   loading={updating}
 * />
 */
function StatusUpdateForm({
  currentStatus,
  onSubmit,
  loading = false,
  className = ''
}) {
  const { t } = useTranslation('common');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  /**
   * Transitions de statut autorisées
   */
  const allowedTransitions = {
    pending: ['in_progress', 'rejected'],
    in_progress: ['resolved', 'pending'],
    resolved: [], // État final (optionnel : peut rouvrir)
    rejected: []  // État final
  };

  /**
   * Obtenir les statuts disponibles selon le statut actuel
   */
  const getAvailableStatuses = () => {
    return allowedTransitions[currentStatus] || [];
  };

  /**
   * Configuration des statuts
   */
  const statusOptions = {
    pending: { label: t('status.pending', { defaultValue: 'En attente' }) },
    in_progress: { label: t('status.in_progress', { defaultValue: 'En cours' }) },
    resolved: { label: t('status.resolved', { defaultValue: 'Résolu' }) },
    rejected: { label: t('status.rejected', { defaultValue: 'Rejeté' }) }
  };

  /**
   * Gérer la soumission du formulaire
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      console.warn('⚠️ Aucun statut sélectionné');
      return;
    }

    if (selectedStatus === currentStatus) {
      console.warn('⚠️ Le statut sélectionné est identique au statut actuel');
      return;
    }

    // Si le nouveau statut est "rejected", demander confirmation
    if (selectedStatus === 'rejected') {
      setShowConfirmDialog(true);
      return;
    }

    // Sinon, soumettre directement
    onSubmit(selectedStatus);
  };

  /**
   * Confirmer le rejet
   */
  const handleConfirmReject = () => {
    setShowConfirmDialog(false);
    onSubmit(selectedStatus);
  };

  const availableStatuses = getAvailableStatuses();

  // Si aucune transition possible
  if (availableStatuses.length === 0) {
    return (
      <div className={`p-4 bg-neutral-50 rounded-lg border border-neutral-200 ${className}`}>
        <p className="text-sm text-neutral-600 text-center">
          Ce signalement est dans un état final.
          <br />
          Aucune transition de statut n'est possible.
        </p>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={currentStatus} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dialog de confirmation pour rejet */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-neutral-900">
                  Confirmer le rejet
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-neutral-600 leading-relaxed">
            Vous êtes sur le point de <strong className="text-error-600">rejeter</strong> ce signalement. 
            Cette action marque le signalement comme <strong>hors périmètre ou invalide</strong>.
            <br /><br />
            Le citoyen ne recevra aucune notification, mais le signalement restera archivé dans le système.
            <br /><br />
            Êtes-vous sûr de vouloir continuer ?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReject}
              className="bg-error-600 hover:bg-error-700 text-white"
            >
              Confirmer le rejet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Statut actuel */}
      <div>
        <Label className="text-sm font-medium text-neutral-700">
          Statut actuel
        </Label>
        <div className="mt-2">
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      {/* Nouveau statut */}
      <div>
        <Label htmlFor="new-status" className="text-sm font-medium text-neutral-700">
          Nouveau statut <span className="text-error-500">*</span>
        </Label>
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          disabled={loading}
        >
          <SelectTrigger id="new-status" className="mt-2">
            <SelectValue placeholder="Sélectionnez un statut" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusOptions[status]?.label || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableStatuses.length > 0 && (
          <p className="text-xs text-neutral-500 mt-1">
            Transitions autorisées : {availableStatuses.map(s => statusOptions[s]?.label).join(', ')}
          </p>
        )}
      </div>

      {/* Bouton de soumission */}
      <Button
        type="submit"
        disabled={!selectedStatus || loading || selectedStatus === currentStatus}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mise à jour en cours...
          </>
        ) : (
          'Mettre à jour le statut'
        )}
      </Button>
    </form>
    </>
  );
}

export default StatusUpdateForm;

