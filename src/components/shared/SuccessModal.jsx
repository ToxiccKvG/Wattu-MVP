
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Home, Map } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Composant SuccessModal - Modal de succès après soumission
 * 
 * Fonctionnalités :
 * - Affiche un message de succès
 * - Affiche l'ID du signalement créé
 * - Boutons de navigation (Accueil, Voir la carte)
 * - Auto-fermeture optionnelle
 * 
 * Props :
 * @param {boolean} open - État d'ouverture du modal
 * @param {function} onClose - Callback de fermeture
 * @param {Object} report - Signalement créé { id, type, ... }
 * @param {boolean} autoRedirect - Redirection automatique après 5s (default: false)
 * 
 * @example
 * <SuccessModal
 *   open={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   report={createdReport}
 * />
 */
function SuccessModal({ open, onClose, report, autoRedirect = false }) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  // Auto-redirection après 5 secondes si activée
  useEffect(() => {
    if (open && autoRedirect) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [open, autoRedirect, navigate]);

  /**
   * Naviguer vers la page d'accueil
   */
  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  /**
   * Naviguer vers la carte
   */
  const handleViewMap = () => {
    onClose();
    navigate('/carte');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icône de succès */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Titre */}
            <DialogTitle className="text-2xl font-bold text-neutral-900">
              {t('success.report_submitted', { defaultValue: 'Signalement envoyé !' })}
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="text-neutral-600">
              {t('success.report_description', {
                defaultValue: 'Merci pour votre contribution ! Votre signalement a été transmis à la commune concernée.'
              })}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Informations du signalement */}
        {report && (
          <div className="space-y-3 my-4">
            {/* ID du signalement */}
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-600 mb-1">
                {t('success.report_id', { defaultValue: 'Référence' })}
              </p>
              <p className="text-sm font-mono font-semibold text-neutral-900 break-all">
                {report.id}
              </p>
            </div>

            {/* Type */}
            {report.type && (
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-900 font-medium">
                  {t('form.type', { defaultValue: 'Type' })} : {report.type}
                </p>
              </div>
            )}

            {/* Message de suivi */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 {t('success.follow_up', {
                  defaultValue: 'Vous pouvez consulter l\'état de votre signalement sur la carte.'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          {/* Voir la carte */}
          <Button
            onClick={handleViewMap}
            className="w-full"
          >
            <Map className="w-4 h-4 mr-2" />
            {t('success.view_map', { defaultValue: 'Voir la carte' })}
          </Button>

          {/* Retour à l'accueil */}
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('success.go_home', { defaultValue: 'Retour à l\'accueil' })}
          </Button>
        </div>

        {/* Auto-redirection notice */}
        {autoRedirect && (
          <p className="text-xs text-neutral-500 text-center mt-4">
            {t('success.auto_redirect', {
              defaultValue: 'Redirection automatique dans 5 secondes...'
            })}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SuccessModal;

