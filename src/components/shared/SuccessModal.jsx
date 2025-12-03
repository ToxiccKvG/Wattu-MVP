
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Map, FileText } from 'lucide-react';
import Confetti from 'react-confetti';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Composant SuccessModal - Modal de succès simplifié avec confettis
 * 
 * Version minimaliste et visuelle :
 * - Confettis animés
 * - Grand checkmark vert
 * - Boutons de navigation simples
 * 
 * Props :
 * @param {boolean} open - État d'ouverture du modal
 * @param {function} onClose - Callback de fermeture
 * @param {Object} report - Signalement créé (optionnel)
 * @param {boolean} autoRedirect - Redirection automatique après 3s (default: false)
 */
function SuccessModal({ open, onClose, report, autoRedirect = false }) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Récupérer la taille de la fenêtre pour les confettis
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-redirection après 3 secondes si activée
  useEffect(() => {
    if (open && autoRedirect) {
      const timer = setTimeout(() => {
        navigate('/home');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, autoRedirect, navigate]);

  const handleViewMap = () => {
    onClose();
    // Petit délai pour laisser le Dialog se fermer avant la navigation
    setTimeout(() => {
      navigate('/carte');
    }, 50);
  };

  const handleViewDashboard = () => {
    onClose();
    // Petit délai pour laisser le Dialog se fermer avant la navigation
    setTimeout(() => {
      navigate('/citizen/dashboard');
    }, 50);
  };

  return (
    <>
      {/* Confettis en plein écran */}
      {open && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-8">
            {/* Grand checkmark animé */}
            <div className="relative">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={2.5} />
              </div>
              {/* Effet de pulse autour */}
              <div className="absolute inset-0 w-32 h-32 bg-green-200 rounded-full animate-ping opacity-30" />
            </div>

            {/* Boutons de navigation */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleViewDashboard}
                className="w-full"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('success.view_dashboard', { defaultValue: 'Mes signalements' })}
              </Button>

              <Button
                onClick={handleViewMap}
                variant="outline"
                className="w-full"
              >
                <Map className="w-4 h-4 mr-2" />
                {t('success.view_map', { defaultValue: 'Carte' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SuccessModal;

