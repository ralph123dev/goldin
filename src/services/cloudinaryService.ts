// Remplacez ces valeurs par les vôtres
const CLOUD_NAME = "demhlpk5q"; // Votre Cloud Name trouvé à l'étape 1
const UPLOAD_PRESET = "chat_media"; // Le nom de votre preset créé à l'étape 2

/**
 * Envoie un fichier vers Cloudinary.
 * @param file Le fichier à envoyer (image, vidéo, audio).
 * @returns L'URL sécurisée du fichier envoyé.
 */
export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  // Détermine le type de ressource pour l'URL de l'API
  let resourceType = 'auto';
  if (file.type.startsWith('image/')) resourceType = 'image';
  if (file.type.startsWith('video/')) resourceType = 'video';
  if (file.type.startsWith('audio/')) resourceType = 'video'; // Audio est traité comme une vidéo sans visuel

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // L'URL du fichier que nous allons stocker dans notre base de données
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};