
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as reportApi from '@/api/reportApi';
import StatusBadge from '@/components/reports/StatusBadge';
import PriorityBadge from '@/components/reports/PriorityBadge';
import StatusUpdateForm from '@/components/reports/StatusUpdateForm';
import PriorityUpdateForm from '@/components/reports/PriorityUpdateForm';
import TypeUpdateForm from '@/components/reports/TypeUpdateForm';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, MapPin, Calendar, User, Phone, Image as ImageIcon, Mic } from 'lucide-react';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Page de détail d'un signalement pour AGENTS et ADMINS
 * 
 * Fonctionnalités :
 * - Affichage complet des informations du signalement
 * - Carte interactive avec localisation
 * - Mise à jour du statut
 * - Mise à jour de la priorité
 * - Affichage des photos
 * 
 * Accès :
 * - Agents (role='agent') : signalements de leur commune uniquement (RLS)
 * - Admins (role='admin') : TOUS les signalements (toutes communes)
 * 
 * Usage :
 * <Route path="/agent/reports/:id" element={<ReportDetail />} />
 * <Route path="/admin/reports/:id" element={<ReportDetail />} />
 */
function ReportDetail() {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // FETCH REPORT
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        console.log(`🔍 Récupération du signalement: ${id}`);

        const { data, error: fetchError } = await reportApi.getReportById(id);

        if (fetchError) {
          setError(fetchError.message || 'Erreur lors du chargement du signalement');
          return;
        }

        if (!data) {
          setError('Signalement introuvable');
          return;
        }

        // Vérifier que le signalement appartient bien à la commune de l'agent (sécurité client)
        // Exception: Les admins peuvent voir tous les signalements
        if (user?.role === 'agent' && data.commune_id !== user?.commune_id) {
          setError('Accès non autorisé à ce signalement');
          return;
        }

        setReport(data);
        setError(null);
        console.log('✅ Signalement chargé:', data);

      } catch (err) {
        console.error('❌ Erreur fetch report:', err);
        setError('Erreur inattendue lors du chargement');
      } finally {
        setLoading(false);
      }
    }

    // Lancer le fetch si on a un ID et un user (agent avec commune OU admin)
    if (id && user) {
      fetchReport();
    }
  }, [id, user]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Mettre à jour le statut
   */
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      console.log(`⚡ Mise à jour statut: ${newStatus}`);

      const { data, error: updateError } = await reportApi.updateReportStatus(id, newStatus);

      if (updateError) {
        toast.error(`Erreur: ${updateError.message}`);
        return;
      }

      setReport(data);
      toast.success('Statut mis à jour avec succès !');
      console.log('✅ Statut mis à jour');

    } catch (err) {
      console.error('❌ Erreur update status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Mettre à jour la priorité
   */
  const handleUpdatePriority = async (newPriority) => {
    try {
      setUpdating(true);
      console.log(`⚡ Mise à jour priorité: ${newPriority}`);

      const { data, error: updateError } = await reportApi.updateReportPriority(id, newPriority);

      if (updateError) {
        toast.error(`Erreur: ${updateError.message}`);
        return;
      }

      setReport(data);
      toast.success('Priorité mise à jour avec succès !');
      console.log('✅ Priorité mise à jour');

    } catch (err) {
      console.error('❌ Erreur update priority:', err);
      toast.error('Erreur lors de la mise à jour de la priorité');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Mettre à jour le type
   */
  const handleUpdateType = async (newType) => {
    try {
      setUpdating(true);
      console.log(`⚡ Mise à jour type: ${newType}`);

      const { data, error: updateError } = await reportApi.updateReportType(id, newType);

      if (updateError) {
        toast.error(`Erreur: ${updateError.message}`);
        return;
      }

      setReport(data);
      toast.success('Type mis à jour avec succès !');
      console.log('✅ Type mis à jour');

    } catch (err) {
      console.error('❌ Erreur update type:', err);
      toast.error('Erreur lors de la mise à jour du type');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Retour à la liste
   */
  const handleBack = () => {
    navigate('/agent/reports');
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="space-y-4">
        <Button onClick={handleBack} variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
          <p className="text-error-700">{error}</p>
        </div>
      </div>
    );
  }

  // Pas de signalement
  if (!report) {
    return (
      <div className="space-y-4">
        <Button onClick={handleBack} variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
          <p className="text-neutral-700">Signalement introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 capitalize">
              {report.type?.replace('_', ' ')}
            </h1>
            <p className="text-neutral-600 mt-1">
              Signalement #{report.id.slice(0, 8)}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </div>
        </div>
      </div>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════
          CONTENU PRINCIPAL (2 COLONNES)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLONNE GAUCHE : Détails */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio ou Description */}
          {report.audio_url ? (
            <Card className="bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 border-2 border-blue-200/50 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b border-blue-200/30">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Mic className="w-5 h-5 text-blue-600" />
                  Enregistrement audio
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AudioPlayer audioUrl={report.audio_url} />
                <p className="text-xs text-blue-700 mt-3 font-medium bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-200/50">
                  Écoutez l'enregistrement pour comprendre le problème signalé
                </p>
              </CardContent>
            </Card>
          ) : report.description ? (
            <Card className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-2 border-amber-200/50 shadow-md">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent border-b border-amber-200/30">
                <CardTitle className="text-lg text-amber-900">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-neutral-700">{report.description}</p>
              </CardContent>
            </Card>
          ) : null}

          {/* Carte - Localisation (en haut maintenant) */}
          <Card className="bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 border-2 border-green-200/50 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent border-b border-green-200/30">
              <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                <MapPin className="w-5 h-5 text-green-600" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64 rounded-lg overflow-hidden border-2 border-green-200/50 shadow-sm">
                <MapContainer
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[report.latitude, report.longitude]}>
                    <Popup>
                      {report.type?.replace('_', ' ')}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="text-xs text-green-700 mt-3 font-medium bg-green-50/50 px-3 py-2 rounded-lg border border-green-200/50">
                Coordonnées : {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
              </p>
            </CardContent>
          </Card>

          {/* Photo du signalement (en bas maintenant) */}
          {report.image_url && (
            <Card className="bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30 border-2 border-purple-200/50 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b border-purple-200/30">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Photo du signalement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full group">
                      <img
                        src={report.image_url}
                        alt="Photo du signalement"
                        className="w-full h-auto max-h-[500px] object-contain rounded-lg border-2 border-purple-200/50 group-hover:opacity-90 transition-opacity cursor-pointer bg-purple-50/30 shadow-sm"
                        onError={(e) => {
                          console.error('❌ Erreur chargement photo:', report.image_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl">
                    <DialogHeader>
                      <DialogTitle>Photo du signalement</DialogTitle>
                    </DialogHeader>
                    <img
                      src={report.image_url}
                      alt="Photo du signalement"
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
                <p className="text-xs text-purple-700 mt-3 text-center font-medium bg-purple-50/50 px-3 py-2 rounded-lg border border-purple-200/50">
                  Cliquez sur la photo pour l'agrandir
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* COLONNE DROITE : Informations & Actions */}
        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-neutral-600">Date de création</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Date(report.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {report.citizen_name && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600">Signalé par</p>
                    <p className="text-sm font-medium text-neutral-900">{report.citizen_name}</p>
                  </div>
                </div>
              )}

              {report.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600">Téléphone</p>
                    <a
                      href={`tel:${report.phone}`}
                      className="text-sm font-medium text-primary-600 hover:underline"
                    >
                      {report.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mise à jour du statut */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gérer le statut</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusUpdateForm
                currentStatus={report.status}
                onSubmit={handleUpdateStatus}
                loading={updating}
              />
            </CardContent>
          </Card>

          {/* Mise à jour de la priorité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gérer la priorité</CardTitle>
            </CardHeader>
            <CardContent>
              <PriorityUpdateForm
                currentPriority={report.priority}
                onSubmit={handleUpdatePriority}
                loading={updating}
              />
            </CardContent>
          </Card>

          {/* Mise à jour du type (surtout utile pour les signalements vocaux) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gérer le type</CardTitle>
            </CardHeader>
            <CardContent>
              <TypeUpdateForm
                currentType={report.type}
                onSubmit={handleUpdateType}
                loading={updating}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;

