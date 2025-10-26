
import { Languages } from 'lucide-react';
import { useLanguage } from '@/context/LangContext';
import { Button } from '@/components/ui/button';

/**
 * Composant Toggle pour changer la langue (FR ↔ Wolof)
 * 
 * Rôle :
 * - Affiche un bouton pour basculer entre Français et Wolof
 * - Visible uniquement pour les CITOYENS (pages publiques)
 * - CACHÉ pour login, agents, admins (français forcé)
 * 
 * Design :
 * - Bouton avec icône globe + label langue
 * - Mobile-friendly (touch target 44x44px)
 * - Accessible (ARIA label)
 * 
 * Usage :
 * <LanguageSwitcher />
 */
function LanguageSwitcher() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { language, changeLanguage, languageLabel } = useLanguage();

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Toggle entre FR et Wolof
   */
  const handleToggle = () => {
    const newLang = language === 'fr' ? 'wo' : 'fr';
    changeLanguage(newLang);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      aria-label={`Changer la langue (actuellement ${languageLabel})`}
      className="flex items-center gap-2 min-h-[44px] min-w-[44px]"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">
        {language === 'fr' ? 'FR' : 'WO'}
      </span>
    </Button>
  );
}

export default LanguageSwitcher;

