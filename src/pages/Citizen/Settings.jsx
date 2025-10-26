
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LangContext';

/**
 * Page Paramètres pour citoyens
 * 
 * Contenu :
 * - Sélection langue (FR/Wolof)
 * - À propos (optionnel)
 * - Contact (optionnel)
 * - Mentions légales (optionnel)
 */
function Settings() {
  const { t, i18n } = useTranslation('common');
  const { changeLanguage } = useLanguage();

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {t('settings.title', { defaultValue: 'Paramètres' })}
        </h1>
        <p className="text-neutral-600">
          {t('settings.subtitle', { defaultValue: 'Personnalisez votre expérience' })}
        </p>
      </div>

      {/* Langue */}
      <section className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          {t('settings.language.title', { defaultValue: 'Langue / Làkk' })}
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => handleLanguageChange('fr')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              i18n.language === 'fr'
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900">Français</p>
                <p className="text-sm text-neutral-600">French</p>
              </div>
              {i18n.language === 'fr' && (
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => handleLanguageChange('wo')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              i18n.language === 'wo'
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900">Wolof</p>
                <p className="text-sm text-neutral-600">Wolof</p>
              </div>
              {i18n.language === 'wo' && (
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
              )}
            </div>
          </button>
        </div>
      </section>

      {/* À propos */}
      <section className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          {t('settings.about.title', { defaultValue: 'À propos de WattU' })}
        </h2>
        <div className="space-y-2 text-neutral-600">
          <p>
            <span className="font-medium text-neutral-900">Version :</span> 1.0.0
          </p>
          <p>
            {t('settings.about.desc', { 
              defaultValue: 'Plateforme de signalement citoyen pour améliorer votre ville' 
            })}
          </p>
        </div>
      </section>
    </div>
  );
}

export default Settings;

