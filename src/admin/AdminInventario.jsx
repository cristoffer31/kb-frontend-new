import React, { useEffect, useState } from "react";
import "./AdminInventario.css";
import { listarProductos } from "../services/productoService"; // Asegúrate que este servicio apunte a /api/productos
import { listarCategorias } from "./services/adminCategoriaService";
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminInventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState(null);
  const [ordenStock, setOrdenStock] = useState(null);

  // Carga inicial
  useEffect(() => {
    listarCategorias().then(data => {
        // Validación extra por si Laravel devuelve objeto en vez de array
        setCategorias(Array.isArray(data) ? data : []);
    });
    filtrar();
  }, []);

  // Función principal de filtrado y carga
  async function filtrar() {
    try {
        const respuesta = await listarProductos();
        
        // --- CORRECCIÓN CLAVE PARA LARAVEL ---
        // 1. Intentamos obtener el array de productos buscando en todas las ubicaciones posibles
        let data = [];
        
        if (Array.isArray(respuesta)) {
            data = respuesta;
        } else if (respuesta.data && Array.isArray(respuesta.data)) {
            // Caso Laravel Paginado
            data = respuesta.data;
        } else if (respuesta.content && Array.isArray(respuesta.content)) {
            // Caso Legacy / Quarkus
            data = respuesta.content;
        } else if (respuesta.data) {
             // Caso Axios directo
             data = Array.isArray(respuesta.data) ? respuesta.data : [];
        }

        if (busqueda.trim() !== "") {
            const term = busqueda.toLowerCase();
            data = data.filter((p) => {
                const nombre = (p.nombre || "").toLowerCase();
                // Buscamos camelCase O snake_case
                const codigo = (p.codigoBarras || p.codigo_barras || "").toLowerCase();
                const agrupador = (p.codigoAgrupador || p.codigo_agrupador || "").toLowerCase();
                
                return nombre.includes(term) || codigo.includes(term) || agrupador.includes(term);
            });
        }

        if (categoria !== "") {
            data = data.filter((p) => {
                // Laravel devuelve la relación como 'categoria', el front antiguo buscaba 'category'
                const catId = p.categoria_id || p.categoryId || (p.categoria?.id) || (p.category?.id);
                return catId === parseInt(categoria);
            });
        }

        if (ordenPrecio) {
            data.sort((a, b) => {
                return ordenPrecio === "asc" ? a.precio - b.precio : b.precio - a.precio;
            });
        }

        if (ordenStock) {
            data.sort((a, b) => {
                return ordenStock === "asc" ? a.stock - b.stock : b.stock - a.stock;
            });
        }

        setProductos(data);
    } catch (e) {
        console.error("Error filtrando inventario:", e);
        setProductos([]);
    }
  }

  // Re-ejecutar filtros cuando cambien los inputs
  useEffect(() => { filtrar(); }, [busqueda, categoria, ordenPrecio, ordenStock]);

  function exportarExcel() {
    if (productos.length === 0) return;
    
    const data = productos.map((p) => ({
      ID: p.id, 
      Nombre: p.nombre || "Sin nombre", 
      Variante: `${p.talla || ""} ${p.variante || ""}`.trim(),
      // Mapeo seguro para Excel
      Agrupador: p.codigoAgrupador || p.codigo_agrupador || "-",
      Codigo: p.codigoBarras || p.codigo_barras || "-",
      Categoría: p.categoria?.nombre || p.category?.nombre || "N/A", 
      Precio: p.precio, 
      Stock: p.stock,
    }));

    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Inventario");
    const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "inventario.xlsx");
  }

  return (
    <div className="inventario-container">
      <h2>Inventario de Productos</h2>

      <div className="filtros">
        <div className="input-group">
          <FaSearch className="icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código o agrupador..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <button className="btn-orden" onClick={() => setOrdenPrecio(ordenPrecio === "asc" ? "desc" : "asc")}>
          Precio {ordenPrecio === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
        </button>

        <button className="btn-orden" onClick={() => setOrdenStock(ordenStock === "asc" ? "desc" : "asc")}>
          Stock {ordenStock === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
        </button>

        <button className="btn-excel" onClick={exportarExcel}>📥 Excel</button>
      </div>

      <div className="tabla-wrapper">
        <table className="inventario-tabla">
          <thead>
            <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Variante</th>
                <th>Agrupador</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                    {/* Buscamos imagenUrl (alias) o imagen (BD) */}
                    <img src={p.imagenUrl || p.imagen || "/placeholder.png"} className="img-mini" alt="p" />
                </td>
                <td>{p.nombre || "Sin Nombre"}</td>
                
                <td>
                    {p.talla ? <span className="badge-variante">Talla {p.talla}</span> : null}
                    {p.variante ? <span className="badge-variante">{p.variante}</span> : null}
                    {!p.talla && !p.variante && <span style={{color:'#ccc'}}>-</span>}
                </td>

                <td style={{fontSize:'0.85rem', color:'#64748b'}}>
                    {/* Soporte para snake_case */}
                    {p.codigoAgrupador || p.codigo_agrupador || "-"}
                </td>

                <td>{p.codigoBarras || p.codigo_barras || "-"}</td>
                
                {/* Soporte para relación 'categoria' (Laravel) o 'category' (Legacy) */}
                <td>{p.categoria?.nombre || p.category?.nombre || "N/A"}</td>
                
                <td>${Number(p.precio || 0).toFixed(2)}</td>
                
                <td style={{fontWeight:'bold', color: p.stock < 10 ? '#ef4444' : '#10b981'}}>
                    {p.stock}
                </td>
              </tr>
            ))}
            
            {productos.length === 0 && (
                <tr>
                    <td colSpan="9" style={{textAlign: "center", padding: "20px"}}>
                        No se encontraron productos.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}