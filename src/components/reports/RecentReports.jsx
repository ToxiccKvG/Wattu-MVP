
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Calendar, ArrowRight, Inbox } from 'lucide-react';

/**
 * Composant affichant les signalements récents (5-10 derniers)
 * 
 * Utilisé dans le dashboard agent pour un aperçu rapide
 * 
 * @param {Object} props
 * @param {Array} props.reports - Liste des signalements récents
 * @param {boolean} [props.loading] - État de chargement
 * @param {string} [props.error] - Message d'erreur
 * @param {number} [props.limit] - Nombre de signalements à afficher (default: 5)
 * @param {string} [props.className] - Classes CSS additionnelles
 * 
 * @example
 * const { user } = useAuth();
 * const { reports, loading } = useAgentReports(user.commune_id);
 * 
 * <RecentReports
 *   reports={reports}
 *   loading={loading}
 *   limit={5}
 * />
 */
function RecentReports({
  reports = [],
  loading = false,
  error = null,
  limit = 5,
  className = ''
}) {
  const { t } = useTranslation('common');

  /**
   * Limiter le nombre de signalements affichés
   */
  const limitedReports = reports.slice(0, limit);

  /**
   * Formater la date en français
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Signalements récents</CardTitle>
          <Link to="/agent/reports">
            <Button variant="ghost" size="sm">
              Voir tous
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {/* État de chargement - Skeleton Cards */}
        {loading && (
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-neutral-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Erreur */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}

        {/* Liste vide */}
        {!loading && !error && limitedReports.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <Inbox className="w-10 h-10 text-neutral-400 mx-auto" />
            <p className="text-sm text-neutral-600">
              Aucun signalement récent
            </p>
          </div>
        )}

        {/* Liste des signalements */}
        {!loading && !error && limitedReports.length > 0 && (
          <div className="space-y-3">
            {limitedReports.map((report) => (
              <Link
                key={report.id}
                to={`/agent/reports/${report.id}`}
                className="block p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Info signalement */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-neutral-900 truncate capitalize">
                      {report.type?.replace('_', ' ') || 'Type inconnu'}
                    </h4>
                    {report.description && (
                      <p className="text-xs text-neutral-600 truncate mt-0.5">
                        {report.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span className="text-xs text-neutral-500">
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-1.5 items-end">
                    <StatusBadge status={report.status} className="text-xs px-2 py-0.5" />
                    <PriorityBadge priority={report.priority} className="text-xs px-2 py-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Indicateur si plus de signalements disponibles */}
        {!loading && !error && reports.length > limit && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <Link to="/agent/reports">
              <Button variant="outline" className="w-full" size="sm">
                Voir les {reports.length - limit} autres signalements
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentReports;

