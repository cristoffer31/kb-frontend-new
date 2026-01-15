import React, { useEffect, useState } from 'react';
import { listarProductos } from '../services/productoService';
import ProductCard from '../components/ProductCard';
import { useLocation } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaBoxOpen, FaSpinner } from 'react-icons/fa';
import ProductModal from "../components/ProductModal";
import './Productos.css';

export default function Productos() {
    const location = useLocation();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Estados de paginación
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Estado para el Modal
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    useEffect(() => {
       setPage(1); 
    }, [location.search]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        cargarData();
    }, [page, location.search]);

    async function cargarData() {
        setCargando(true);
        try {
            const urlParams = new URLSearchParams(location.search);
            urlParams.set('page', page);

            const queryString = `?${urlParams.toString()}`;
            console.log("Petición final:", queryString); 

            const res = await listarProductos(queryString);
            
            // Lógica robusta para detectar datos
            if (res && res.data) {
                // Si viene paginado (Laravel standard)
                if (res.data.data && Array.isArray(res.data.data)) {
                    setProductos(res.data.data);
                    setLastPage(res.data.last_page || 1);
                    setTotal(res.data.total || 0);
                } 
                // Si viene array directo (sin paginación)
                else if (Array.isArray(res.data)) {
                    setProductos(res.data);
                    setLastPage(1);
                    setTotal(res.data.length);
                }
                // Caso alternativo (estructura plana)
                else {
                     setProductos(res.data);
                     setLastPage(res.last_page || 1);
                     setTotal(res.total || 0);
                }
            }
        } catch (error) {
            console.error("Error cargando productos:", error);
            setProductos([]);
        } finally {
            setCargando(false);
        }
    }

    if (cargando) {
        return (
            <div className="productos-loading">
                <FaSpinner className="icon-spin" />
                <p>Cargando catálogo de KB Collection...</p>
            </div>
        );
    }

    return (
        <div className="productos-page">
            <header className="productos-header">
                <h1>Nuestros Productos</h1>
                <p>{total} artículos encontrados</p>
            </header>

            <div className="container">
                {productos.length > 0 ? (
                    <>
                        <div className="productos-grid">
                            {productos.map(prod => (
                                // AQUI ESTÁ LA CLAVE: El onClick abre el modal
                                <div 
                                    key={prod.id} 
                                    onClick={() => setProductoSeleccionado(prod)}
                                    style={{ cursor: 'pointer' }} // Para que se vea que es clicable
                                >
                                    <ProductCard producto={prod} />
                                </div>
                            ))}
                        </div>

                        {/* BOTONES DE PAGINACIÓN */}
                        {lastPage > 1 && (
                            <div className="pagination-container">
                                <button 
                                    className="pagination-btn"
                                    disabled={page === 1} 
                                    onClick={() => setPage(prev => prev - 1)}
                                >
                                    <FaChevronLeft /> <span>Anterior</span>
                                </button>

                                <div className="pagination-pages">
                                    <span>Página <strong>{page}</strong> de {lastPage}</span>
                                </div>

                                <button 
                                    className="pagination-btn"
                                    disabled={page === lastPage} 
                                    onClick={() => setPage(prev => prev + 1)}
                                >
                                    <span>Siguiente</span> <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="productos-empty">
                        <FaBoxOpen size={60} />
                        <h3>No hay productos disponibles</h3>
                        <p>Intenta ajustar tu búsqueda o recargar la página.</p>
                    </div>
                )}
            </div>

            {/* MODAL DE DETALLE DEL PRODUCTO */}
            {productoSeleccionado && (
                <ProductModal 
                    producto={productoSeleccionado} 
                    onClose={() => setProductoSeleccionado(null)} 
                />
            )}
        </div>
    );
}