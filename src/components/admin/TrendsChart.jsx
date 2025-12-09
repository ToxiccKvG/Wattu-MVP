

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Lazy load Recharts (bundle lourd) - uniquement chargé pour admins
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));

/**
 * Composant affichant l'évolution des signalements (30 derniers jours)
 * 
 * @param {Array} trends - Données de tendance (from calculateGlobalAnalytics)
 * @param {string} trends[].date - Date au format YYYY-MM-DD
 * @param {number} trends[].count - Nombre de signalements
 * @param {boolean} loading - État de chargement
 * 
 * @example
 * <TrendsChart trends={trends} loading={loading} />
 */
function TrendsChart({ trends, loading }) {
  const { t } = useTranslation('admin');

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border-2 border-indigo-200/50 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent border-b border-indigo-200/30">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            {t('trends.title', { defaultValue: 'Évolution des signalements' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-neutral-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border-2 border-indigo-200/50 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent border-b border-indigo-200/30">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            {t('trends.title', { defaultValue: 'Évolution des signalements' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500 text-center py-12">
            {t('trends.no_data', { defaultValue: 'Aucune donnée disponible' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Formater les données pour Recharts (afficher seulement quelques dates sur l'axe X)
  const formattedTrends = trends.map((item, index) => {
    const date = new Date(item.date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    return {
      ...item,
      displayDate: `${day}/${month}`,
      fullDate: item.date
    };
  });

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.fullDate);
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });

      return (
        <div className="bg-white border-2 border-primary-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-neutral-900">{formattedDate}</p>
          <p className="text-lg font-bold text-primary-600">
            {data.count} signalement{data.count > 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border-2 border-indigo-200/50 shadow-md">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent border-b border-indigo-200/30">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          {t('trends.title', { defaultValue: 'Évolution des signalements' })}
        </CardTitle>
        <p className="text-sm text-indigo-700 font-medium">
          {t('trends.subtitle', { defaultValue: '30 derniers jours' })}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense 
          fallback={
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={formattedTrends}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name={t('trends.reports', { defaultValue: 'Signalements' })}
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Suspense>
      </CardContent>
    </Card>
  );
}

export default TrendsChart;

