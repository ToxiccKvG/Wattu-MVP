
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import * as React from 'react';
import { Toaster } from 'sonner';
import { LangProvider } from '@/context/LangContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// Layouts (chargés immédiatement car nécessaires pour structure)
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AgentLayout from '@/layouts/AgentLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Route Guards (chargés immédiatement car nécessaires pour sécurité)
import RequireAuth from '@/components/shared/RequireAuth';
import RequireRole from '@/components/shared/RequireRole';
import RequireCitizenAuth from '@/components/shared/RequireCitizenAuth';

// Pages (lazy loading pour améliorer performance)
const Login = lazy(() => import('@/pages/Login'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
// EmailConfirmation supprimé - Plus utilisé (inscription uniquement via OAuth Google)
// const EmailConfirmation = lazy(() => import('@/pages/EmailConfirmation'));
const Welcome = lazy(() => import('@/pages/Citizen/Welcome'));
const HomePage = lazy(() => import('@/pages/Citizen/HomePage'));
const CitizenMap = lazy(() => import('@/pages/Citizen/CitizenMap'));
const NewSignalement = lazy(() => import('@/pages/Citizen/NewSignalement'));
const CitizenDashboard = lazy(() => import('@/pages/Citizen/CitizenDashboard'));
const Settings = lazy(() => import('@/pages/Citizen/Settings'));
const VoiceEnroll = lazy(() => import('@/pages/Citizen/VoiceEnroll'));
const VoiceVerify = lazy(() => import('@/pages/Citizen/VoiceVerify'));
const AgentDashboard = lazy(() => import('@/pages/Agent/AgentDashboard'));
const ReportList = lazy(() => import('@/pages/Agent/ReportList'));
const ReportDetail = lazy(() => import('@/pages/Agent/ReportDetail'));
const AgentTrends = lazy(() => import('@/pages/Agent/AgentTrends'));
const AdminDashboard = lazy(() => import('@/pages/Admin/AdminDashboard'));
const GlobalReports = lazy(() => import('@/pages/Admin/GlobalReports'));
const AdminAnalytics = lazy(() => import('@/pages/Admin/AdminAnalytics'));

/**
 * Composant de chargement affiché pendant le lazy loading
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="text-neutral-600 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

/**
 * Composant principal de l'application WattU
 * 
 * Architecture :
 * - BrowserRouter : Gestion des routes
 * - LangProvider : Context global pour langue (FR/Wolof)
 * - AuthProvider : Context global pour authentification
 * - Suspense : Gestion du lazy loading des pages
 * - Routes publiques : Accessible sans auth (citoyens)
 * - Routes protégées : Nécessite auth + rôle (agents/admins)
 * 
 * Hiérarchie des Contexts :
 * BrowserRouter → LangProvider → AuthProvider → Suspense → Routes
 * 
 * Note : AuthProvider DOIT être à l'intérieur de BrowserRouter
 * car il utilise useNavigate() pour les redirections
 */
function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications (Sonner) */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />

      {/* Context global pour la langue */}
      <LangProvider>
        {/* Context global pour l'authentification */}
        <AuthProvider>
          {/* Suspense pour gérer le chargement des pages lazy */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* ═══════════════════════════════════════════════════════════
                PAGE WELCOME (Inscription citoyens - Publique)
                ═══════════════════════════════════════════════════════════ */}

              <Route path="/welcome" element={<Welcome />} />
              
              {/* Routes d'authentification vocale (publiques) */}
              <Route path="/voice-enroll" element={<VoiceEnroll />} />
              <Route path="/voice-verify" element={<VoiceVerify />} />

              {/* ═══════════════════════════════════════════════════════════
                ROUTE RACINE - Redirection intelligente
                ═══════════════════════════════════════════════════════════ */}
              
              <Route index element={<RootRedirect />} />
              <Route path="/" element={<RootRedirect />} />

              {/* ═══════════════════════════════════════════════════════════
                ROUTES CITOYENS (Protégées - Nécessitent authentification)
                ═══════════════════════════════════════════════════════════ */}

              {/* Layout public avec LanguageSwitcher + BottomNavigation */}
              <Route 
                element={
                  <RequireCitizenAuth>
                    <PublicLayout />
                  </RequireCitizenAuth>
                }
              >
                {/* Page d'accueil (Dashboard citoyen) - Route protégée */}
                <Route path="/home" element={<HomePage />} />

                {/* Carte interactive des signalements */}
                <Route path="/carte" element={<CitizenMap />} />

                {/* Nouveau signalement */}
                <Route path="/signalements/nouveau" element={<NewSignalement />} />

                {/* Dashboard citoyen */}
                <Route path="/citizen/dashboard" element={<CitizenDashboard />} />

                {/* Paramètres (langue FR/Wolof) */}
                <Route path="/parametres" element={<Settings />} />
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                LOGIN & AUTH CALLBACK (Routes standalone)
                ═══════════════════════════════════════════════════════════ */}

              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Route EmailConfirmation supprimée - Plus utilisée (inscription uniquement via OAuth Google) */}

              {/* ═══════════════════════════════════════════════════════════
                ROUTES AGENT (Protégées + Role-based)
                ═══════════════════════════════════════════════════════════ */}

              <Route
                path="/agent/*"
                element={
                  <RequireAuth>
                    <RequireRole allowedRoles={['agent']}>
                      <AgentLayout />
                    </RequireRole>
                  </RequireAuth>
                }
              >
                {/* Dashboard agent */}
                <Route path="dashboard" element={<AgentDashboard />} />

                {/* Liste des signalements */}
                <Route path="reports" element={<ReportList />} />

                {/* Détail d'un signalement */}
                <Route path="reports/:id" element={<ReportDetail />} />

                {/* Tendances statistiques */}
                <Route path="trends" element={<AgentTrends />} />

                {/* Redirection par défaut : /agent → /agent/dashboard */}
                <Route index element={<Navigate to="/agent/dashboard" replace />} />
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                ROUTES ADMIN (Protégées + Role-based)
                ═══════════════════════════════════════════════════════════ */}

              <Route
                path="/admin/*"
                element={
                  <RequireAuth>
                    <RequireRole allowedRoles={['admin']}>
                      <AdminLayout />
                    </RequireRole>
                  </RequireAuth>
                }
              >
                {/* Dashboard admin */}
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* Liste de TOUS les signalements */}
                <Route path="reports" element={<GlobalReports />} />

                {/* Détail d'un signalement (réutilise le même que Agent) */}
                <Route path="reports/:id" element={<ReportDetail />} />

                {/* Analytics statistiques */}
                <Route path="analytics" element={<AdminAnalytics />} />

                {/* Redirection par défaut : /admin → /admin/dashboard */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* ═══════════════════════════════════════════════════════════
                ROUTE 404 - Page non trouvée
                ═══════════════════════════════════════════════════════════ */}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}

/**
 * Composant de redirection racine (doit être à l'intérieur d'AuthProvider)
 * 
 * Redirige intelligemment selon l'état d'authentification :
 * - Non authentifié → /welcome (inscription)
 * - Authentifié citoyen (role = 'citizen') → /home
 * - Authentifié agent/admin → leur dashboard respectif
 */
function RootRedirectInner() {
  const { isAuthenticated, user, loading, hasSession } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = React.useRef(false);

  useEffect(() => {
    // ⚠️ IMPORTANT : Attendre que le chargement soit terminé
    if (loading) {
      return; // Ne rien faire tant que la vérification n'est pas terminée
    }

    // Éviter les redirections multiples
    if (hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;

    // Si pas de session Supabase → Rediriger vers /welcome
    if (!hasSession || !isAuthenticated) {
      console.log('🔀 Redirection vers /welcome (pas de session)');
      navigate('/welcome', { replace: true });
      return;
    }

    // Si session existe mais pas de profil → Rediriger vers /welcome (cas rare)
    if (!user) {
      console.log('🔀 Redirection vers /welcome (pas de profil)');
      navigate('/welcome', { replace: true });
      return;
    }

    // Rediriger selon le rôle
    if (user.role === 'admin') {
      console.log('🔀 Redirection vers /admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
    } else if (user.role === 'agent') {
      console.log('🔀 Redirection vers /agent/dashboard');
      navigate('/agent/dashboard', { replace: true });
    } else if (user.role === 'citizen') {
      console.log('🔀 Redirection vers /home');
      navigate('/home', { replace: true });
    } else {
      // Rôle inconnu → Rediriger vers /welcome
      console.log('🔀 Redirection vers /welcome (rôle inconnu)');
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, hasSession, user, loading, navigate]);

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="text-sm text-neutral-600">Chargement...</p>
      </div>
    </div>
  );
}

/**
 * Wrapper pour RootRedirect (doit être à l'intérieur d'AuthProvider)
 */
function RootRedirect() {
  return <RootRedirectInner />;
}

/**
 * Composant 404 - Page non trouvée
 * 
 * Simple page d'erreur pour routes inexistantes
 */
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-neutral-900">404</h1>
        <p className="text-xl text-neutral-600">Page non trouvée</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

export default App;
