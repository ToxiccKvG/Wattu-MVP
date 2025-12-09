
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Mic, Square, RefreshCcw, AlertCircle, Check, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SuccessModal from '@/components/shared/SuccessModal';
import useAudioRecording from '@/hooks/useAudioRecording';
import useGeolocation from '@/hooks/useGeolocation';
import useImageUpload from '@/hooks/useImageUpload';
import { useAuth } from '@/context/AuthContext';
import * as reportService from '@/services/reportService';

/**
 * Composant SignalementForm - Formulaire simplifié de signalement vocal
 * 
 * Nouveau flux simplifié (SANS analyse audio Gemini) :
 * 1. Enregistrement audio (30s max)
 * 2. Récupération automatique de la localisation GPS (en arrière-plan, sans affichage)
 * 3. Sélection photo optionnelle (directement dans le formulaire)
 * 4. Soumission directe avec audio + infos citoyen depuis profil
 * 
 * Les informations du citoyen (nom, téléphone, commune, adresse, email) sont
 * automatiquement récupérées depuis le profil utilisateur connecté.
 * L'audio est envoyé directement à Supabase Storage sans transcription.
 * 
 * @param {string} [props.initialType] - Type pré-sélectionné depuis l'URL (ex: 'securite', 'eclairage', 'dechets')
 * 
 * @example
 * <SignalementForm initialType="securite" />
 */
function SignalementForm({ initialType = null }) {
  const { t } = useTranslation('common');
  const { user, getVoiceUser, isVoiceAuthenticated } = useAuth(); // Récupérer les infos du citoyen connecté
  const audioRecording = useAudioRecording({ maxDuration: 30 });
  const geolocation = useGeolocation();
  const imageUpload = useImageUpload();

  const [step, setStep] = useState('idle'); // idle | recording | location | photo | submitting
  const [isManualPosition, setIsManualPosition] = useState(false);
  const [reportType, setReportType] = useState(initialType || ''); // Type choisi par le citoyen ou depuis l'URL
  const [position, setPosition] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdReport, setCreatedReport] = useState(null);

  // Mettre à jour le type si initialType change
  useEffect(() => {
    if (initialType) {
      setReportType(initialType);
    }
  }, [initialType]);

  /**
   * Obtenir le label du type pour l'affichage
   * Utilise les labels de home.types pour les types venant de la page d'accueil
   */
  const getTypeLabel = (type) => {
    if (!type) return '';
    
    // Si le type vient de la page d'accueil (initialType), utiliser les labels spécifiques
    if (initialType) {
      const typeMap = {
        'securite': t('home.types.agression', { defaultValue: 'Agression' }),
        'eclairage': t('home.types.eclairage', { defaultValue: 'Eclairage' }),
        'dechets': t('home.types.dechets', { defaultValue: 'Déchets' }),
      };
      return typeMap[type] || t(`report_types.${type}`, { defaultValue: type });
    }
    
    // Sinon, utiliser les labels standards
    return t(`report_types.${type}`, { defaultValue: type });
  };

  /**
   * Valider les données avant soumission
   */
  const validateData = () => {
    // Vérifier qu'un type de problème a été choisi
    if (!reportType) {
      return { valid: false, error: t('errors.type_required', { defaultValue: 'Choisissez le type de problème à signaler' }) };
    }

    // Vérifier qu'on a un audio
    if (!audioRecording.audioBlob) {
      return { valid: false, error: t('errors.audio_required', { defaultValue: 'Un enregistrement audio est requis' }) };
    }
    // Vérifier qu'on a une position GPS
    if (!position) {
      return { valid: false, error: t('errors.position_required', { defaultValue: 'La position GPS est obligatoire' }) };
    }
    // Note: commune_id n'est plus obligatoire pour les voice users
    // Les agents pourront assigner la commune plus tard
    return { valid: true };
  };

  /**
   * Soumettre le signalement
   * @param {File|null} photoFile - Fichier photo passé directement (pour éviter problème setState async)
   */
  const handleSubmit = async (photoFile = null) => {
    // Protection contre les doubles appels
    if (isSubmitting) {
      console.warn('⚠️ Soumission déjà en cours, ignoré');
      return;
    }

    const validation = validateData();
    if (!validation.valid) {
      setSubmitError(validation.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setStep('submitting');
    
    // Utiliser photoFile passé en paramètre OU imageUpload.imageFile (fallback)
    const finalPhotoFile = photoFile || imageUpload.imageFile;

    try {
      console.log('📤 Soumission du signalement...');

      // Convertir le Blob audio en File pour l'upload
      const audioBlob = audioRecording.audioBlob;
      
      // Normaliser le type MIME (enlever les paramètres comme codecs=opus)
      let normalizedMimeType = audioBlob.type || 'audio/webm';
      // Si le type contient des paramètres (ex: "audio/webm;codecs=opus"), prendre seulement la partie principale
      if (normalizedMimeType.includes(';')) {
        normalizedMimeType = normalizedMimeType.split(';')[0];
      }
      
      // S'assurer que le type est dans la liste autorisée
      const allowedTypes = ['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
      if (!allowedTypes.includes(normalizedMimeType)) {
        // Fallback vers audio/webm si le type n'est pas reconnu
        normalizedMimeType = 'audio/webm';
      }
      
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
        type: normalizedMimeType,
      });
      
      console.log('🎤 Type MIME audio normalisé:', {
        original: audioBlob.type,
        normalized: normalizedMimeType,
        size: audioBlob.size,
      });

      // Déterminer les infos citoyen (Supabase user OU voice user)
      const voiceUser = getVoiceUser();
      const isVoice = isVoiceAuthenticated();

      const submitData = {
        type: reportType || 'autre', // Utiliser le type choisi, fallback ultime "autre"
        description: null, // Pas de description textuelle, l'audio contient tout
        latitude: position.lat,
        longitude: position.lng,
        commune_id: user?.commune_id || null, // Depuis le profil utilisateur (null pour voice users)
        // Infos citoyen : priorité au voice user si authentifié vocalement
        phone: isVoice ? (voiceUser?.phone || null) : (user?.phone || null),
        citizen_name: isVoice 
          ? `${voiceUser?.prenom || ''} ${voiceUser?.name || ''}`.trim() 
          : (user?.name || null),
        email: user?.email || null,
        citizen_user_id: isVoice ? voiceUser?.id : (user?.id || null), // Lier au voice_user ou user Supabase
        imageFile: finalPhotoFile || null,
        audioBlob: audioFile, // Audio envoyé directement
      };

      const result = await reportService.submitReport(submitData);

      if (result.validationErrors) {
        setSubmitError(Object.values(result.validationErrors)[0] || t('errors.submit_failed'));
        console.error('❌ Erreurs de validation:', result.validationErrors);
        return;
      }

      if (result.error) {
        setSubmitError(result.error.message);
        console.error('❌ Erreur soumission:', result.error);
        return;
      }

      console.log('✅ Signalement créé:', result.report.id);
      setCreatedReport(result.report);
      setShowSuccess(true);
      resetForm();

    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
      setSubmitError(t('errors.submit_failed', {
        defaultValue: 'Une erreur est survenue. Veuillez réessayer.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPosition(null);
    setSubmitError(null);
    setStep('idle');
    setIsManualPosition(false);
    audioRecording.resetRecording();
    imageUpload.removeImage();
  };

  const handleStartRecording = async () => {
    const permissionState = await audioRecording.requestPermission();
    if (permissionState === 'denied') {
      return;
    }
    const result = await audioRecording.startRecording();
    if (result.success) {
      setStep('recording');
      geolocation.startAutoCapture();
    }
  };

  const handleStopRecording = () => {
    audioRecording.stopRecording();
    // La localisation est déjà en cours de capture automatique depuis handleStartRecording
    // Attendre que la position soit disponible, puis passer directement à la photo
    if (position) {
      // Si on a déjà une position, passer directement à la photo
      setStep('photo');
    } else {
      // Sinon, attendre que la position soit capturée
    setStep('location');
    }
  };

  const handleRetryRecording = () => {
    resetForm();
  };

  // Mettre à jour la position quand le GPS capture une position
  useEffect(() => {
    if (geolocation.position && !isManualPosition) {
      const newPosition = {
        lat: geolocation.position.latitude,
        lng: geolocation.position.longitude,
      };
      setPosition(newPosition);
      
      // Si on est en attente de localisation après l'enregistrement, passer directement à la photo
      if (step === 'location' && audioRecording.audioBlob && !audioRecording.isRecording) {
        setStep('photo');
      }
    }
  }, [geolocation.position, isManualPosition, step, audioRecording.audioBlob, audioRecording.isRecording]);

  const recordingProgress = audioRecording.maxDuration
    ? Math.min(100, Math.round((audioRecording.duration / audioRecording.maxDuration) * 100))
    : 0;

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t('voice.recording_title', { defaultValue: 'Enregistrement vocal' })}
              </h3>
              <div className="text-right">
                <p className="text-2xl font-mono text-primary-700">{audioRecording.duration}s</p>
                <p className="text-xs text-neutral-500">/ {audioRecording.maxDuration}s</p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-200">
              <div
                className={`h-full rounded-full ${audioRecording.isRecording ? 'bg-primary-600 animate-pulse' : 'bg-primary-400'}`}
                style={{ width: `${recordingProgress}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!audioRecording.isRecording ? (
                <Button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={!audioRecording.isSupported || step === 'submitting' || step === 'photo'}
                  className="flex-1 md:flex-none bg-black hover:bg-neutral-900 text-white"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {step === 'idle'
                    ? t('voice.start_recording', { defaultValue: "Commencer l'enregistrement" })
                    : t('voice.re_record', { defaultValue: 'Réenregistrer' })}
                </Button>
              ) : (
                <Button type="button" variant="destructive" onClick={handleStopRecording} className="flex-1 md:flex-none">
                  <Square className="mr-2 h-4 w-4" />
                  {t('voice.stop_recording', { defaultValue: 'Arrêter' })}
                </Button>
              )}
              {audioRecording.audioBlob && !audioRecording.isRecording && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetryRecording}
                  disabled={step === 'submitting'}
                  className="flex-1 md:flex-none"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {t('voice.reset', { defaultValue: 'Réinitialiser' })}
                </Button>
              )}
              {(!audioRecording.isSupported || audioRecording.error) && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {audioRecording.error?.message ||
                      t('voice.not_supported', { defaultValue: 'Non supporté' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Choix du type de problème - Masqué si type déjà fourni depuis l'URL */}
        {!initialType && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('report.type_section_title', { defaultValue: 'Quel type de problème signalez-vous ?' })}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'voirie', label: t('report_types.voirie', { defaultValue: 'Route / chaussée' }) },
              { value: 'eclairage', label: t('report_types.eclairage', { defaultValue: 'Éclairage public' }) },
              { value: 'eau', label: t('report_types.eau', { defaultValue: 'Eau' }) },
              { value: 'dechets', label: t('report_types.dechets', { defaultValue: 'Déchets / Propreté' }) },
              { value: 'securite', label: t('report_types.securite', { defaultValue: 'Sécurité' }) },
              { value: 'assainissement', label: t('report_types.assainissement', { defaultValue: 'Assainissement' }) },
              { value: 'espaces_verts', label: t('report_types.espaces_verts', { defaultValue: 'Espaces verts' }) },
              { value: 'transport', label: t('report_types.transport', { defaultValue: 'Transport' }) },
              { value: 'autre', label: t('report_types.autre', { defaultValue: 'Autre' }) },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setReportType(type.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                  reportType === type.value
                    ? 'bg-primary-50 text-primary-900 border-primary-600 shadow-sm ring-2 ring-primary-200'
                    : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {reportType === type.value && (
                  <Check className="w-4 h-4" />
                )}
                {type.label}
              </button>
            ))}
          </div>
        </section>
        )}

        {/* Affichage du type sélectionné si fourni depuis l'URL */}
        {initialType && reportType && (
          <section className="rounded-2xl border border-primary-200 bg-primary-50 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary-600" />
              <p className="text-sm font-medium text-primary-900">
                {t('report.type_selected', { defaultValue: 'Type sélectionné' })}: <span className="font-semibold">
                  {getTypeLabel(reportType)}
                </span>
              </p>
            </div>
          </section>
        )}

        {/* La localisation est récupérée automatiquement en arrière-plan, pas d'affichage */}

        {/* Section photo optionnelle - affichée après l'enregistrement audio */}
        {step === 'photo' && audioRecording.audioBlob && position && (
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t('photo_sheet.title', { defaultValue: 'Ajouter une photo' })}
              </h3>
              <span className="text-xs text-neutral-500 font-normal">
                {t('form.optional', { defaultValue: 'Optionnel' })}
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              {t('photo_sheet.description', {
                defaultValue: 'Prenez une photo pour illustrer le problème (optionnel)',
              })}
            </p>

            {/* Zone de sélection de photo */}
            {!imageUpload.imagePreview ? (
              <label
                htmlFor="photo-input"
                className="block w-full p-8 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary-500 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3">
                  {imageUpload.isCompressing ? (
                    <>
                      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                      <p className="text-sm text-primary-600 font-medium">
                        {t('form.compressing', { defaultValue: 'Compression en cours...' })}
                      </p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-neutral-400" />
                      <p className="text-sm text-neutral-600 font-medium">
                        {t('photo_sheet.select_photo', {
                          defaultValue: 'Touchez pour prendre une photo',
                        })}
                      </p>
                      <p className="text-xs text-neutral-500">
                        JPEG, PNG, WebP (max 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={imageUpload.selectImage}
                  className="hidden"
                  disabled={imageUpload.isCompressing}
          />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imageUpload.imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border-2 border-neutral-200"
                />
                <button
                  type="button"
                  onClick={imageUpload.removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  aria-label={t('photo_sheet.remove_photo', {
                    defaultValue: 'Supprimer la photo',
                  })}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {imageUpload.error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{imageUpload.error.message}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => handleSubmit()}
                className="w-full"
                disabled={isSubmitting || imageUpload.isCompressing}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('form.submitting', { defaultValue: 'Envoi en cours...' })}
                  </>
                ) : (
                  t('form.submit', { defaultValue: 'Envoyer le signalement' })
                )}
              </Button>
            </div>
          </section>
        )}

        {/* Erreur de soumission je ne ferais peut etre pas cette erreur avec cela mais let's go */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* État de soumission */}
        {step === 'submitting' && (
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-primary-900">
                {t('form.submitting', { defaultValue: 'Envoi en cours...' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de succès */}
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        report={createdReport}
      />
    </>
  );
}

export default SignalementForm;

