import api from "./api";

/**
 * Lista productos con paginación
 * @param {number} page - El número de página a solicitar
 */
export async function listarProductos(queryOrPage = 1) {
    try {
        const query = typeof queryOrPage === 'number' 
            ? `?page=${queryOrPage}` 
            : queryOrPage;

        const res = await api.get(`/productos${query}`);
        return res.data; 
    } catch (error) {
        console.error("Error en listarProductos service:", error);
        throw error;
    }
}

export async function buscarProductosRapido(termino) {
    const res = await api.get(`/productos?buscar=${termino}`);
    return res.data;
}
export async function buscarProductos(params) {
    const res = await api.get('/productos/buscar', { params });
    return res.data;
}

export async function obtenerProducto(id) {
    const res = await api.get(`/productos/${id}`);
    return res.data;
}

export async function listarOfertas() {
    const res = await api.get('/productos/ofertas');
    return res.data;
}