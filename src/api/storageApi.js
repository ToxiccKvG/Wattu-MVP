
import { supabase } from '@/config/supabase';

/**
 * API Layer pour Supabase Storage (Images & Audio des signalements)
 * 
 * Buckets :
 * - report-images : photos (5MB max)
 * - report-audio  : enregistrements vocaux (10MB max, audio/webm|mp3|mpeg|wav|ogg)
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
const MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload une image pour un signalement
 * 
 * @param {File} file - Fichier image à uploader
 * @param {string} [reportId] - ID du signalement (optionnel, généré si absent)
 * 
 * @returns {Promise<{url: string|null, path: string|null, error: Object|null}>}
 * 
 * @example
 * const result = await uploadReportImage(file, 'uuid-report');
 * if (result.error) {
 *   console.error('Erreur upload:', result.error.message);
 * } else {
 *   console.log('URL publique:', result.url);
 * }
 */
export async function uploadReportImage(file, reportId = null) {
  try {
    // Validation 1: Fichier présent
    if (!file) {
      return {
        url: null,
        path: null,
        error: {
          message: 'Aucun fichier fourni',
          code: 'NO_FILE'
        }
      };
    }

    // Validation 2: Type MIME autorisé
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        url: null,
        path: null,
        error: {
          message: `Type de fichier non autorisé. Types acceptés: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          code: 'INVALID_FILE_TYPE'
        }
      };
    }

    // Validation 3: Taille du fichier (max 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        path: null,
        error: {
          message: `Fichier trop volumineux (max 5MB). Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          code: 'FILE_TOO_LARGE'
        }
      };
    }

    // Génération du nom du fichier
    // Format : reports/{reportId}-{timestamp}.{extension}
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const reportUuid = reportId || `temp-${timestamp}`;
    const fileName = `${reportUuid}-${timestamp}.${extension}`;
    const filePath = `reports/${fileName}`;

    console.log(`📤 Upload en cours: ${filePath} (${(file.size / 1024).toFixed(2)}KB)`);

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Ne pas écraser si le fichier existe déjà
      });

    if (error) {
      console.error('❌ Erreur upload Supabase Storage:', error);
      return { url: null, path: null, error };
    }

    // Récupération de l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    console.log('✅ Image uploadée:', publicUrl);

    return {
      url: publicUrl,
      path: filePath,
      error: null
    };

  } catch (err) {
    console.error('❌ Erreur inattendue uploadReportImage:', err);
    return {
      url: null,
      path: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Supprimer une image du storage
 * 
 * Note : Cette fonction devrait être réservée aux admins
 * La policy Supabase `report_images_admin_delete` protège cette action
 * 
 * @param {string} filePath - Chemin du fichier dans le bucket (ex: 'reports/uuid-123.jpg')
 * 
 * @returns {Promise<{success: boolean, error: Object|null}>}
 * 
 * @example
 * const result = await deleteReportImage('reports/uuid-123.jpg');
 */
export async function deleteReportImage(filePath) {
  try {
    if (!filePath) {
      return {
        success: false,
        error: {
          message: 'Chemin du fichier requis',
          code: 'NO_FILE_PATH'
        }
      };
    }

    console.log(`🗑️ Suppression en cours: ${filePath}`);

    const { data, error } = await supabase.storage
      .from('report-images')
      .remove([filePath]);

    if (error) {
      console.error('❌ Erreur suppression image:', error);
      return { success: false, error };
    }

    console.log('✅ Image supprimée:', filePath);
    return { success: true, error: null };

  } catch (err) {
    console.error('❌ Erreur inattendue deleteReportImage:', err);
    return {
      success: false,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

/**
 * Récupérer l'URL publique d'une image
 * 
 * @param {string} filePath - Chemin du fichier dans le bucket
 * 
 * @returns {string|null} URL publique de l'image
 * 
 * @example
 * const url = getPublicUrl('reports/uuid-123.jpg');
 */
export function getPublicUrl(filePath) {
  try {
    if (!filePath) {
      console.error('❌ Chemin du fichier requis');
      return null;
    }

    const { data } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (err) {
    console.error('❌ Erreur inattendue getPublicUrl:', err);
    return null;
  }
}

/**
 * Vérifier si un type MIME est autorisé
 * 
 * @param {string} mimeType - Type MIME à vérifier
 * @returns {boolean} true si autorisé, false sinon
 * 
 * @example
 * isAllowedImageType('image/jpeg') // true
 * isAllowedImageType('image/gif') // false
 */
export function isAllowedImageType(mimeType) {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

/**
 * Vérifier si la taille du fichier est valide
 * 
 * @param {number} fileSize - Taille du fichier en bytes
 * @returns {boolean} true si valide, false sinon
 * 
 * @example
 * isValidFileSize(2 * 1024 * 1024) // true (2MB)
 * isValidFileSize(10 * 1024 * 1024) // false (10MB)
 */
export function isValidFileSize(fileSize) {
  return fileSize <= MAX_FILE_SIZE;
}

function getAudioExtension(mimeType) {
  switch (mimeType) {
    case 'audio/mpeg':
    case 'audio/mp3':
      return 'mp3';
    case 'audio/wav':
      return 'wav';
    case 'audio/ogg':
      return 'ogg';
    case 'audio/webm':
    default:
      return 'webm';
  }
}

export async function uploadReportAudio(file, reportId = null) {
  try {
    if (!file) {
      return {
        url: null,
        path: null,
        error: {
          message: 'Aucun fichier audio fourni',
          code: 'NO_AUDIO_FILE',
        },
      };
    }

    // Normaliser le type MIME (enlever les paramètres comme codecs=opus)
    let mimeType = file.type || 'audio/webm';
    if (mimeType.includes(';')) {
      mimeType = mimeType.split(';')[0].trim();
    }

    if (!ALLOWED_AUDIO_TYPES.includes(mimeType)) {
      return {
        url: null,
        path: null,
        error: {
          message: `Type audio non autorisé. Types acceptés: ${ALLOWED_AUDIO_TYPES.join(', ')}. Type reçu: ${file.type || 'inconnu'}`,
          code: 'INVALID_AUDIO_TYPE',
        },
      };
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      return {
        url: null,
        path: null,
        error: {
          message: `Audio trop volumineux (max 10MB). Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          code: 'AUDIO_TOO_LARGE',
        },
      };
    }

    const timestamp = Date.now();
    const extension = file.name?.split('.')?.pop() || getAudioExtension(mimeType);
    const reportUuid = reportId || `temp-${timestamp}`;
    const fileName = `${reportUuid}-${timestamp}.${extension}`;
    const filePath = `records/${fileName}`;

    console.log(`📤 Upload audio en cours: ${filePath} (${(file.size / 1024).toFixed(2)}KB)`);

    const { error } = await supabase.storage.from('report-audio').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeType,
    });

    if (error) {
      console.error('❌ Erreur upload audio Supabase:', error);
      
      // Si l'erreur est "Bucket not found", donner des instructions claires
      if (error.message?.includes('Bucket not found') || 
          error.message?.includes('not found') ||
          error.message?.includes('does not exist') ||
          error.statusCode === 404) {
        return {
          url: null,
          path: null,
          error: {
            message: 'Le bucket de stockage audio "report-audio" n\'existe pas ou n\'est pas accessible. Veuillez contacter l\'administrateur.',
            code: 'BUCKET_NOT_FOUND',
            originalError: error,
            hint: 'Le bucket doit être créé dans Supabase Dashboard > Storage avec les permissions publiques.',
          },
        };
      }
      
      return { url: null, path: null, error };
    }

    const { data: publicUrlData } = supabase.storage.from('report-audio').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    console.log('✅ Audio uploadé:', publicUrl);

    return {
      url: publicUrl,
      path: filePath,
      error: null,
    };
  } catch (err) {
    console.error('❌ Erreur inattendue uploadReportAudio:', err);
    return {
      url: null,
      path: null,
      error: {
        message: err.message || 'Erreur inattendue',
        code: 'UNEXPECTED_ERROR',
      },
    };
  }
}

export function isAllowedAudioType(mimeType) {
  return ALLOWED_AUDIO_TYPES.includes(mimeType);
}

export function isValidAudioSize(fileSize) {
  return fileSize <= MAX_AUDIO_FILE_SIZE;
}

export default {
  uploadReportImage,
  uploadReportAudio,
  deleteReportImage,
  getPublicUrl,
  isAllowedImageType,
  isValidFileSize,
  isAllowedAudioType,
  isValidAudioSize,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  ALLOWED_AUDIO_TYPES,
  MAX_AUDIO_FILE_SIZE,
};

