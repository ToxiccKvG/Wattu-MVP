

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Composant affichant les 5 statistiques globales (Admin Dashboard)
 * 
 * @param {Object} stats - Statistiques globales (from useGlobalStats)
 * @param {number} stats.total - Total signalements
 * @param {number} stats.pending - Signalements en attente
 * @param {number} stats.in_progress - Signalements en cours
 * @param {number} stats.resolved - Signalements résolus
 * @param {number} stats.rejected - Signalements rejetés
 * 
 * @example
 * <GlobalStats stats={stats} />
 */
function GlobalStats({ stats }) {
  const { t } = useTranslation('admin');

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: t('stats.total', { defaultValue: 'Total Signalements' }),
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: t('stats.pending', { defaultValue: 'En Attente' }),
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: t('stats.in_progress', { defaultValue: 'En Cours' }),
      value: stats.in_progress,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: t('stats.resolved', { defaultValue: 'Résolus' }),
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: t('stats.rejected', { defaultValue: 'Rejetés' }),
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={index}
            className={`border-2 ${card.borderColor} hover:shadow-lg transition-shadow duration-200`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">
                {card.value.toLocaleString('fr-FR')}
              </div>
              {/* Optionnel: Pourcentage vs total */}
              {index > 0 && stats.total > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  {Math.round((card.value / stats.total) * 100)}% du total
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default GlobalStats;

