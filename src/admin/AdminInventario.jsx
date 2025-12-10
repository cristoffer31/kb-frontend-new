import React, { useEffect, useState } from "react";
import "./AdminInventario.css";
import { listarProductos } from "../services/productoService";
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

  useEffect(() => {
    listarCategorias().then(data => setCategorias(Array.isArray(data) ? data : []));
    filtrar();
  }, []);

  async function filtrar() {
    try {
        const respuesta = await listarProductos();
        let data = respuesta.content || (Array.isArray(respuesta) ? respuesta : []);
        if (!Array.isArray(data)) data = [];

        if (busqueda.trim() !== "") {
            const term = busqueda.toLowerCase();
            data = data.filter((p) => {
                const nombre = (p.nombre || "").toLowerCase();
                const codigo = (p.codigoBarras || "").toLowerCase();
                const agrupador = (p.codigoAgrupador || "").toLowerCase();
                
                return nombre.includes(term) || codigo.includes(term) || agrupador.includes(term);
            });
        }

        if (categoria !== "") {
            data = data.filter((p) => p.category?.id === parseInt(categoria));
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

  useEffect(() => { filtrar(); }, [busqueda, categoria, ordenPrecio, ordenStock]);

  function exportarExcel() {
    if (productos.length === 0) return;
    const data = productos.map((p) => ({
      ID: p.id, 
      Nombre: p.nombre || "Sin nombre", 
      Variante: `${p.talla || ""} ${p.variante || ""}`.trim(),
      Agrupador: p.codigoAgrupador || "-",
      Codigo: p.codigoBarras || "-",
      Categoría: p.category?.nombre || "N/A", 
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
                <td><img src={p.imagenUrl || "/placeholder.png"} className="img-mini" alt="p" /></td>
                <td>{p.nombre || "Sin Nombre"}</td>
                
                <td>
                    {p.talla ? <span className="badge-variante">Talla {p.talla}</span> : null}
                    {p.variante ? <span className="badge-variante">{p.variante}</span> : null}
                    {!p.talla && !p.variante && <span style={{color:'#ccc'}}>-</span>}
                </td>

                <td style={{fontSize:'0.85rem', color:'#64748b'}}>
                    {p.codigoAgrupador || "-"}
                </td>

                <td>{p.codigoBarras || "-"}</td>
                <td>{p.category?.nombre || "N/A"}</td>
                <td>${Number(p.precio || 0).toFixed(2)}</td>
                
                <td style={{fontWeight:'bold', color: p.stock < 10 ? '#ef4444' : '#10b981'}}>
                    {p.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}