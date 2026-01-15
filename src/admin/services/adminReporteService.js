import api from "../../services/api"; 

export const obtenerVentasPorCategoria = async (inicio, fin) => {
    const response = await api.get(`/admin/reportes/categorias?inicio=${inicio}&fin=${fin}`);
    return response.data;
};

export const obtenerTopClientes = async (inicio, fin) => {
    const response = await api.get(`/admin/reportes/clientes?inicio=${inicio}&fin=${fin}`);
    return response.data;
};

export const obtenerReporteDetallado = async (inicio, fin) => {
    const response = await api.get(`/admin/reportes/detallado?inicio=${inicio}&fin=${fin}`);
    return response.data;
};