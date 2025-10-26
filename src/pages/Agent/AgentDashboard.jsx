
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import useAgentStats from '@/hooks/useAgentStats';
import useAgentReports from '@/hooks/useAgentReports';
import RecentReports from '@/components/reports/RecentReports';

/**
 * Dashboard principal pour les AGENTS
 * 
 * Rôle :
 * - Vue d'ensemble des signalements de la commune de l'agent
 * - Statistiques en temps réel
 * - Signalements récents
 * - Français uniquement (forcé par DashboardLayout)
 * 
 * Accès :
 * - Réservé aux utilisateurs avec role='agent'
 * - Protégé par RequireAuth + RequireRole
 * - Scope : commune_id de l'agent (via RLS Supabase)
 * 
 * Usage :
 * <Route path="/agent/dashboard" element={<AgentDashboard />} />
 */
function AgentDashboard() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { user, userName } = useAuth();

  // Récupérer les statistiques de la commune
  const { stats, loading: statsLoading, error: statsError } = useAgentStats(user?.commune_id);

  // Récupérer les signalements récents (5 derniers)
  const { reports, loading: reportsLoading, error: reportsError } = useAgentReports(
    user?.commune_id,
    { limit: 5 }
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          HEADER - Bienvenue
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">
          Bienvenue, {userName || 'Agent'} 👋
        </h1>
        <p className="text-neutral-600 mt-1">
          Tableau de bord - Gestion des signalements de votre commune
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATISTIQUES - Vue d'ensemble
          ═══════════════════════════════════════════════════════════ */}
      
      {/* État de chargement - Skeleton Cards */}
      {statsLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Erreur */}
      {statsError && !statsLoading && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 text-center">
          <p className="text-error-700 text-sm">{statsError}</p>
        </div>
      )}

      {/* Statistiques */}
      {!statsLoading && !statsError && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Carte 1 : En attente */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                En attente
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-warning-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.pending || 0}
              </div>
            <p className="text-xs text-neutral-500 mt-1">
              Signalements à traiter
            </p>
          </CardContent>
        </Card>

          {/* Carte 2 : En cours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                En cours
              </CardTitle>
              <Clock className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.in_progress || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                En traitement
              </p>
            </CardContent>
          </Card>

          {/* Carte 3 : Résolus */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Résolus
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.resolved || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Problèmes traités
              </p>
            </CardContent>
          </Card>

          {/* Carte 4 : Rejetés */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Rejetés
              </CardTitle>
              <XCircle className="h-4 w-4 text-error-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.rejected || 0}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Hors périmètre
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SIGNALEMENTS RÉCENTS
          ═══════════════════════════════════════════════════════════ */}
      <RecentReports
        reports={reports}
        loading={reportsLoading}
        error={reportsError}
        limit={5}
      />
    </div>
  );
}

export default AgentDashboard;

