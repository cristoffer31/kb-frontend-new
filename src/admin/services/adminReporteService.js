import axios from "axios";

// Ajusta tu URL base
const API_URL = "http://localhost:8000/api"; 

const getHeaders = () => {
    const token = localStorage.getItem("token"); 
    return { headers: { "Authorization": `Bearer ${token}` } };
};

export const obtenerVentasPorCategoria = async (inicio, fin) => {
    // Enviamos las fechas como query params ?inicio=...&fin=...
    const response = await axios.get(
        `${API_URL}/admin/reportes/categorias?inicio=${inicio}&fin=${fin}`, 
        getHeaders()
    );
    return response.data;
};

export const obtenerTopClientes = async (inicio, fin) => {
    const response = await axios.get(
        `${API_URL}/admin/reportes/clientes?inicio=${inicio}&fin=${fin}`, 
        getHeaders()
    );
    return response.data;
};

export const obtenerReporteDetallado = async (inicio, fin) => {
    const response = await axios.get(
        `${API_URL}/admin/reportes/detallado?inicio=${inicio}&fin=${fin}`, 
        getHeaders()
    );
    return response.data;
};