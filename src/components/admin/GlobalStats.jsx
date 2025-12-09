

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
      borderColor: 'border-blue-200',
      gradient: 'from-blue-50/50 via-white to-cyan-50/30',
      headerGradient: 'from-blue-50 to-transparent',
      headerBorder: 'border-blue-200/30',
      titleColor: 'text-blue-900'
    },
    {
      title: t('stats.pending', { defaultValue: 'En Attente' }),
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      gradient: 'from-yellow-50/50 via-white to-amber-50/30',
      headerGradient: 'from-yellow-50 to-transparent',
      headerBorder: 'border-yellow-200/30',
      titleColor: 'text-yellow-900'
    },
    {
      title: t('stats.in_progress', { defaultValue: 'En Cours' }),
      value: stats.in_progress,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-50/50 via-white to-red-50/30',
      headerGradient: 'from-orange-50 to-transparent',
      headerBorder: 'border-orange-200/30',
      titleColor: 'text-orange-900'
    },
    {
      title: t('stats.resolved', { defaultValue: 'Résolus' }),
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      gradient: 'from-green-50/50 via-white to-emerald-50/30',
      headerGradient: 'from-green-50 to-transparent',
      headerBorder: 'border-green-200/30',
      titleColor: 'text-green-900'
    },
    {
      title: t('stats.rejected', { defaultValue: 'Rejetés' }),
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      gradient: 'from-red-50/50 via-white to-rose-50/30',
      headerGradient: 'from-red-50 to-transparent',
      headerBorder: 'border-red-200/30',
      titleColor: 'text-red-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={index}
            className={`bg-gradient-to-br ${card.gradient} border-2 ${card.borderColor}/50 hover:shadow-lg transition-all duration-200 shadow-md`}
          >
            <CardHeader className={`pb-3 bg-gradient-to-r ${card.headerGradient} border-b ${card.headerBorder}`}>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-sm font-medium ${card.titleColor}`}>
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor} shadow-sm`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-neutral-900">
                {card.value.toLocaleString('fr-FR')}
              </div>
              {/* Optionnel: Pourcentage vs total */}
              {index > 0 && stats.total > 0 && (
                <p className={`text-xs ${card.titleColor} mt-2 font-medium bg-white/50 px-2 py-1 rounded-lg border ${card.borderColor}/30 inline-block`}>
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

