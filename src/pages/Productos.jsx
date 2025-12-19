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

  const [searchParams, setSearchParams] = useSearchParams();
  const busquedaUrl = searchParams.get("buscar") || "";
  const catUrl = searchParams.get("cat");

  const [filtroNombre, setFiltroNombre] = useState(busquedaUrl);
  const [filtroCategoria, setFiltroCategoria] = useState(catUrl ? Number(catUrl) : "");

  useEffect(() => {
    listarCategorias().then(data => {
        const lista = data.data || (Array.isArray(data) ? data : []);
        setCategorias(lista);
    });
  }, []);

  useEffect(() => {
    setFiltroNombre(busquedaUrl);
    if (catUrl) setFiltroCategoria(Number(catUrl));
    else setFiltroCategoria("");
  }, [busquedaUrl, catUrl]);

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      try {
        let data = [];
        if (filtroNombre || filtroCategoria) {
            const res = await buscarProductos(filtroNombre, filtroCategoria || null);
            data = res.data || (Array.isArray(res) ? res : []);
        } else {
            const res = await listarProductos(0); 
            data = res.data || res.content || (Array.isArray(res) ? res : []);
        }
        setProductos(data);
      } catch (e) {
        console.error(e);
        setProductos([]);
      } finally {
        setCargando(false);
      }
    }
    const timer = setTimeout(cargarDatos, 500);
    return () => clearTimeout(timer);
  }, [filtroNombre, filtroCategoria]);

  const handleSearchChange = (e) => {
      const valor = e.target.value;
      setFiltroNombre(valor);
      const params = {};
      if (valor) params.buscar = valor;
      if (filtroCategoria) params.cat = filtroCategoria;
      setSearchParams(params);
  };

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

      <div className="filtros">
        <input 
            type="text" 
            placeholder="Buscar producto..." 
            value={filtroNombre}
            onChange={handleSearchChange}
        />
        <select value={filtroCategoria} onChange={handleCatChange}>
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {cargando ? <div style={{textAlign:'center', padding:'20px'}}>Cargando...</div> : (
          <div className="galeria-container">
            {productos.length === 0 ? (
              <p style={{width:'100%', textAlign:'center'}}>No se encontraron productos.</p>
            ) : (
              productos.map((prod) => (
                <div key={prod.id} className="tarjeta-wrapper" onClick={() => setProductoSeleccionado(prod)}>
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