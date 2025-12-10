import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; 
import { listarProductos, buscarProductos } from "../services/productoService";
import { listarCategorias } from "../services/categoriaService";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import "./Productos.css";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Leemos la URL para saber si hay filtros activos
  const [searchParams, setSearchParams] = useSearchParams();
  const busquedaUrl = searchParams.get("buscar") || "";
  const catUrl = searchParams.get("cat");

  const [filtroNombre, setFiltroNombre] = useState(busquedaUrl);
  const [filtroCategoria, setFiltroCategoria] = useState(catUrl ? Number(catUrl) : "");

  useEffect(() => {
    listarCategorias().then(data => setCategorias(Array.isArray(data) ? data : []));
  }, []);

  // Sincronizar estado si la URL cambia (ej: clic en categoría desde Home)
  useEffect(() => {
    setFiltroNombre(busquedaUrl);
    if (catUrl) setFiltroCategoria(Number(catUrl));
  }, [busquedaUrl, catUrl]);

  // --- EFECTO MAESTRO DE CARGA ---
  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      try {
        let data = [];

        // Si hay algún filtro (nombre o categoría), usamos el BUSCADOR
        if (filtroNombre || filtroCategoria) {
            data = await buscarProductos(filtroNombre, filtroCategoria || null);
        } 
        // Si no hay filtros, cargamos la página inicial
        else {
            const res = await listarProductos(0);
            data = res.content || [];
        }

        setProductos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setProductos([]);
      } finally {
        setCargando(false);
      }
    }
    
    // Pequeño retardo para no saturar si escribes rápido
    const timer = setTimeout(cargarDatos, 300);
    return () => clearTimeout(timer);

  }, [filtroNombre, filtroCategoria]);

  // Actualizar URL y Estado al cambiar categoría
  const handleCatChange = (e) => {
      const valor = e.target.value;
      setFiltroCategoria(valor);
      
      const params = {};
      if (filtroNombre) params.buscar = filtroNombre;
      if (valor) params.cat = valor;
      setSearchParams(params);
  };

  return (
    <div className="productos-page">
      <h1>Catálogo</h1>

      <div className="filtros" style={{marginBottom:'30px', display:'flex', gap:'10px'}}>
        <input 
            type="text" 
            placeholder="Buscar..." 
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            style={{padding:'10px', borderRadius:'8px', border:'1px solid #ccc'}}
        />
        <select value={filtroCategoria} onChange={handleCatChange} style={{padding:'10px', borderRadius:'8px', border:'1px solid #ccc'}}>
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
          <div className="productos-grid">
            {productos.length === 0 ? (
              <p style={{textAlign:'center', width:'100%', gridColumn:'1/-1'}}>No se encontraron productos.</p>
            ) : (
              productos.map((prod) => (
                <div key={prod.id} onClick={() => setProductoSeleccionado(prod)} style={{cursor:'pointer'}}>
                    <ProductCard producto={prod} />
                </div>
              ))
            )}
          </div>
      )}

      {productoSeleccionado && (
        <ProductModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
      )}
    </div>
  );
}