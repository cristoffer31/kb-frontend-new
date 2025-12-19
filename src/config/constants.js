export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage/";
export const BAC_LINK_PAGO = import.meta.env.VITE_BAC_LINK || "https://pagos.baccredomatic.com/TU_LINK_AQUI";

/**
 * Función helper para obtener URL completa de imágenes
 * Maneja casos donde la imagen es null, url completa o ruta relativa.
 * @param {string} path - Ruta o URL de la imagen
 * @param {string} [placeholder] - URL de placeholder opcional
 */
export const getImageUrl = (path, placeholder = "https://via.placeholder.com/300?text=Sin+Imagen") => {
    if (!path) return placeholder;
    if (path.startsWith("http")) return path;
    return `${STORAGE_URL}${path}`;
};
