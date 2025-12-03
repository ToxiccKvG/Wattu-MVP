
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * Formulaire de connexion pour agents et admins
 * 
 * Rôle :
 * - Affiche un formulaire email + password
 * - Valide les champs (email format, password longueur)
 * - Appelle AuthContext.login() pour authentifier
 * - Affiche les erreurs de manière sécurisée
 * - Loading state pendant authentification
 * 
 * Design :
 * - shadcn/ui components (Card, Input, Button, Label)
 * - Mobile-friendly (responsive)
 * - Accessible (ARIA labels, focus management)
 * - Messages d'erreur clairs et sécurisés
 * 
 * Sécurité :
 * - Pas de credentials stockés dans state
 * - Erreurs filtrées via authService (pas d'infos techniques)
 * - Validation côté client + serveur
 * 
 * Usage :
 * <LoginForm />
 */
function LoginForm() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════

  const { t } = useTranslation();
  const { login } = useAuth();

  // ═══════════════════════════════════════════════════════════
  // ÉTAT LOCAL
  // ═══════════════════════════════════════════════════════════

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Erreurs de validation spécifiques aux champs
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // ═══════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════

  /**
   * Valide le format de l'email
   */
  const validateEmail = (value) => {
    if (!value.trim()) {
      return t('login.errors.emailRequired', { defaultValue: 'L\'email est obligatoire' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return t('login.errors.emailInvalid', { defaultValue: 'Format d\'email invalide' });
    }

    return null;
  };

  /**
   * Valide la longueur du mot de passe
   */
  const validatePassword = (value) => {
    if (!value) {
      return t('login.errors.passwordRequired', { defaultValue: 'Le mot de passe est obligatoire' });
    }

    if (value.length < 6) {
      return t('login.errors.passwordMinLength', { defaultValue: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    return null;
  };

  /**
   * Valide tous les champs avant soumission
   */
  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    return !emailErr && !passwordErr;
  };

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Gère le changement de l'email
   * Nettoie l'erreur quand l'user modifie le champ
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(null);
    if (error) setError(null);
  };

  /**
   * Gère le changement du password
   * Nettoie l'erreur quand l'user modifie le champ
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    if (error) setError(null);
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Nettoyer les erreurs précédentes
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validation côté client
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Appel AuthContext.login() (qui gère redirection automatique)
      const result = await login(email.trim(), password, 'fr');

      if (!result.success) {
        // Afficher l'erreur sécurisée (filtrée par authService)
        setError(result.error);
      }
      // Si succès, la redirection est automatique (gérée par AuthContext)

    } catch (err) {
      // Erreur inattendue (normalement déjà gérée par authService)
      setError(t('login.errors.unexpected', { defaultValue: 'Une erreur est survenue. Veuillez réessayer.' }));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {t('login.title', { defaultValue: 'Connexion' })}
        </CardTitle>
        <CardDescription className="text-center">
          {t('login.subtitle', { defaultValue: 'Espace réservé aux agents et administrateurs' })}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ═══════════════════════════════════════════════════════════
              EMAIL FIELD
              ═══════════════════════════════════════════════════════════ */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('login.email', { defaultValue: 'Email' })}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('login.emailPlaceholder', { defaultValue: 'votre.email@exemple.com' })}
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={emailError ? 'border-error-500 focus:ring-error-500' : ''}
            />
            {emailError && (
              <p id="email-error" className="text-sm text-error-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {emailError}
              </p>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              PASSWORD FIELD
              ═══════════════════════════════════════════════════════════ */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {t('login.password', { defaultValue: 'Mot de passe' })}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t('login.passwordPlaceholder', { defaultValue: '••••••••' })}
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={passwordError ? 'border-error-500 focus:ring-error-500' : ''}
            />
            {passwordError && (
              <p id="password-error" className="text-sm text-error-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </p>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              GLOBAL ERROR MESSAGE
              ═══════════════════════════════════════════════════════════ */}
          {error && (
            <div className="p-3 rounded-lg bg-error-50 border border-error-200">
              <p className="text-sm text-error-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SUBMIT BUTTON
              ═══════════════════════════════════════════════════════════ */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('login.loading', { defaultValue: 'Connexion en cours...' })}
              </>
            ) : (
              t('login.submit', { defaultValue: 'Se connecter' })
            )}
          </Button>
        </form>

        {/* ═══════════════════════════════════════════════════════════
            HELPER TEXT (optionnel)
            ═══════════════════════════════════════════════════════════ */}
        <p className="mt-4 text-center text-sm text-neutral-500">
          {t('login.help', { defaultValue: 'Vous avez oublié votre mot de passe ?' })}
        </p>
      </CardContent>
    </Card>
  );
}

export default LoginForm;

