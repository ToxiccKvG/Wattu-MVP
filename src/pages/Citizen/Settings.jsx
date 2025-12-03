
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { useCommunes } from '@/hooks/useCommunes';
import { Button } from '@/components/ui/button';
import { LogOut, User, Phone, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';

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
  const { user, logout, getVoiceUser, isVoiceAuthenticated, logoutVoiceUser, updateVoiceUser } = useAuth();
  const { communes } = useCommunes();
  const navigate = useNavigate();

  // Récupérer l'utilisateur vocal si présent
  const voiceUser = getVoiceUser();
  const isVoice = isVoiceAuthenticated();

  // Trouver la commune de l'utilisateur (Supabase ou voice user)
  const userCommune = useMemo(() => {
    const communeId = user?.commune_id || voiceUser?.commune_id;
    if (!communeId || !communes.length) return null;
    return communes.find(c => c.id === communeId);
  }, [user?.commune_id, voiceUser?.commune_id, communes]);

  // Nom d'affichage (Supabase ou voice user)
  const displayName = user?.name || (voiceUser ? `${voiceUser.prenom || ''} ${voiceUser.name || ''}`.trim() : null);

  // États pour l'édition
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || voiceUser?.phone || '');

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  const handleLogout = async () => {
    try {
      // Si voice user, utiliser logoutVoiceUser
      if (isVoice) {
        logoutVoiceUser();
        toast.success(t('settings.logout.success', { defaultValue: 'Déconnexion réussie' }));
        navigate('/welcome', { replace: true });
        return;
      }

      // Sinon, utiliser logout Supabase
      const result = await logout(i18n.language);
      if (result.success) {
        toast.success(t('settings.logout.success', { defaultValue: 'Déconnexion réussie' }));
      } else {
        toast.error(result.error || t('settings.logout.error', { defaultValue: 'Erreur lors de la déconnexion' }));
      }
    } catch (err) {
      console.error('Erreur déconnexion:', err);
      toast.error(t('settings.logout.error', { defaultValue: 'Erreur lors de la déconnexion' }));
    }
  };

  const handleSaveName = () => {
    if (!isVoice) return;

    const trimmedName = nameInput.trim();
    let prenom = voiceUser?.prenom || null;
    let nom = voiceUser?.name || null;

    if (trimmedName) {
      const parts = trimmedName.split(/\s+/);
      prenom = parts[0];
      nom = parts.length > 1 ? parts.slice(1).join(' ') : '';
    }

    const updated = updateVoiceUser({
      prenom,
      name: nom,
    });

    if (updated) {
      toast.success(t('settings.account.save_success', { defaultValue: 'Nom mis à jour' }));
      setEditingName(false);
    } else {
      toast.error(t('settings.account.save_error', { defaultValue: 'Erreur lors de la mise à jour' }));
    }
  };

  const handleSavePhone = () => {
    if (!isVoice) return;

    const updated = updateVoiceUser({
      phone: phoneInput ? phoneInput.trim() : null,
    });

    if (updated) {
      toast.success(t('settings.account.save_success', { defaultValue: 'Téléphone mis à jour' }));
      setEditingPhone(false);
    } else {
      toast.error(t('settings.account.save_error', { defaultValue: 'Erreur lors de la mise à jour' }));
    }
  };

  const handleCancelEdit = (field) => {
    if (field === 'name') {
      setNameInput(displayName || '');
      setEditingName(false);
    } else if (field === 'phone') {
      setPhoneInput(user?.phone || voiceUser?.phone || '');
      setEditingPhone(false);
    }
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

      {/* Compte utilisateur */}
      <section className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          {t('settings.account.title', { defaultValue: 'Mon compte' })}
        </h2>
        <div className="space-y-4">
          {/* Nom */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500">
                {t('settings.account.name', { defaultValue: 'Nom' })}
              </p>
              {editingName && isVoice ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('settings.account.name_placeholder', { defaultValue: 'Votre nom complet' })}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    aria-label={t('settings.account.save', { defaultValue: 'Enregistrer' })}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCancelEdit('name')}
                    className="p-2 rounded-md bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition-colors"
                    aria-label={t('buttons.cancel', { defaultValue: 'Annuler' })}
                  >
                    <X className="h-4 w-4" />
                  </button>
            </div>
              ) : (
                <div className="mt-1 flex items-center justify-between">
              <p className="font-medium text-neutral-900">
                    {displayName || t('settings.account.notAvailable', { defaultValue: 'Non disponible' })}
              </p>
                  {isVoice && (
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1.5 rounded-md text-neutral-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      aria-label={t('settings.account.edit', { defaultValue: 'Modifier' })}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
            </div>
              )}
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500">
                {t('settings.account.phone', { defaultValue: 'Numéro de téléphone' })}
              </p>
              {editingPhone && isVoice ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="tel"
                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('settings.account.phone_placeholder', { defaultValue: 'Optionnel' })}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                  <button
                    onClick={handleSavePhone}
                    className="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    aria-label={t('settings.account.save', { defaultValue: 'Enregistrer' })}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCancelEdit('phone')}
                    className="p-2 rounded-md bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition-colors"
                    aria-label={t('buttons.cancel', { defaultValue: 'Annuler' })}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between">
              <p className="font-medium text-neutral-900">
                    {user?.phone || voiceUser?.phone || t('settings.account.notAvailable', { defaultValue: 'Non disponible' })}
              </p>
                  {isVoice && (
                    <button
                      onClick={() => setEditingPhone(true)}
                      className="p-1.5 rounded-md text-neutral-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      aria-label={t('settings.account.edit', { defaultValue: 'Modifier' })}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bouton de déconnexion */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-error-200 text-error-600 hover:bg-error-50 hover:text-error-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('settings.logout.button', { defaultValue: 'Se déconnecter' })}
          </Button>
        </div>
      </section>

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

