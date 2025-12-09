

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Composant affichant le top 5 des communes par volume de signalements
 * 
 * @param {Array} topCommunes - Top communes (from reportApi.getTopCommunes)
 * @param {boolean} loading - État de chargement
 * 
 * @example
 * <TopCommunes topCommunes={topCommunes} loading={loading} />
 */
function TopCommunes({ topCommunes, loading }) {
  const { t } = useTranslation('admin');

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 border-2 border-amber-200/50 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent border-b border-amber-200/30">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Award className="w-5 h-5 text-amber-600" />
            {t('top_communes.title', { defaultValue: 'Top 5 Communes' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topCommunes || topCommunes.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 border-2 border-amber-200/50 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent border-b border-amber-200/30">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Award className="w-5 h-5 text-amber-600" />
            {t('top_communes.title', { defaultValue: 'Top 5 Communes' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500 text-center py-8">
            {t('top_communes.no_data', { defaultValue: 'Aucune donnée disponible' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-neutral-100 border-neutral-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-neutral-200';
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 border-2 border-amber-200/50 shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent border-b border-amber-200/30">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Award className="w-5 h-5 text-amber-600" />
          {t('top_communes.title', { defaultValue: 'Top 5 Communes' })}
        </CardTitle>
        <p className="text-sm text-amber-700 font-medium">
          {t('top_communes.subtitle', { defaultValue: 'Classées par volume de signalements' })}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {topCommunes.map((commune, index) => {
            const rank = index + 1;
            const medal = getMedalEmoji(rank);
            const colorClass = getMedalColor(rank);

            return (
              <div
                key={commune.commune_id}
                className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${colorClass}`}
              >
                <div className="flex items-center justify-between">
                  {/* Rang + Nom commune */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {medal && <span className="text-2xl">{medal}</span>}
                      <span className="text-lg font-bold text-neutral-700">
                        {rank}.
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold text-neutral-900">
                          {commune.commune_name}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {commune.commune_region}
                      </p>
                    </div>
                  </div>

                  {/* Nombre de signalements */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {commune.total_reports}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {t('top_communes.reports', { defaultValue: 'signalements' })}
                    </p>
                  </div>
                </div>

                {/* Détails statuts (optionnel) */}
                <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-neutral-600">
                      {commune.pending} {t('top_communes.pending', { defaultValue: 'attente' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-neutral-600">
                      {commune.in_progress} {t('top_communes.in_progress', { defaultValue: 'cours' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-neutral-600">
                      {commune.resolved} {t('top_communes.resolved', { defaultValue: 'résolus' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TopCommunes;

