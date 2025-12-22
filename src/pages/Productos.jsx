import React, { useEffect, useState } from 'react';
import { listarProductos } from '../services/productoService';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaBoxOpen, FaSpinner } from 'react-icons/fa';
import './Productos.css';

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Estados de paginación
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        // Cada vez que cambie la página, volvemos arriba y cargamos datos
        window.scrollTo({ top: 0, behavior: 'smooth' });
        cargarData();
    }, [page]);

    async function cargarData() {
        setCargando(true);
        try {
            const res = await listarProductos(page);
            // Laravel Paginate devuelve: res.data (items), res.last_page, res.total
            setProductos(res.data || []);
            setLastPage(res.last_page || 1);
            setTotal(res.total || 0);
        } catch (error) {
            console.error("Error al cargar productos:", error);
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

            {productos.length > 0 ? (
                <>
                    <div className="productos-grid">
                        {productos.map(prod => (
                            <ProductCard key={prod.id} producto={prod} />
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
                                <FaChevronLeft /> Anterior
                            </button>

                            <div className="pagination-pages">
                                <span>Página <strong>{page}</strong> de {lastPage}</span>
                            </div>

                            <button 
                                className="pagination-btn"
                                disabled={page === lastPage} 
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                Siguiente <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="productos-empty">
                    <FaBoxOpen size={60} />
                    <h3>No hay productos disponibles</h3>
                    <p>Intenta recargar la página más tarde.</p>
                </div>
            )}
        </div>
    );
}