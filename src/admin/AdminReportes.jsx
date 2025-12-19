import React, { useEffect, useState } from "react";
// Asegúrate de que estas rutas sean correctas
import { obtenerVentasPorCategoria, obtenerTopClientes, obtenerReporteDetallado } from "./services/adminReporteService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FaFileExcel, FaCalendarAlt, FaChartPie, FaTrophy } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./AdminReportes.css";

const COLORES = ["#38bdf8", "#34d399", "#facc15", "#f87171", "#a78bfa", "#f472b6"];

export default function AdminReportes() {
  const [ventasCat, setVentasCat] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  
  // Filtros de fecha (Por defecto: Mes actual)
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fechaInicio, setFechaInicio] = useState(primerDia);
  const [fechaFin, setFechaFin] = useState(ultimoDia);

  useEffect(() => {
    cargarDatos();
  }, [fechaInicio, fechaFin]);

  async function cargarDatos() {
    try {
        const [resCat, resClientes] = await Promise.all([
            obtenerVentasPorCategoria(fechaInicio, fechaFin),
            obtenerTopClientes(fechaInicio, fechaFin)
        ]);
        
        const categoriasLimpias = (Array.isArray(resCat) ? resCat : []).map(item => ({
            ...item,
            valor: Number(item.valor),       
            cantidad: Number(item.cantidad)  
        }));

        const clientesLimpios = (Array.isArray(resClientes) ? resClientes : []).map(item => ({
            ...item,
            valor: Number(item.valor),
            pedidos_count: Number(item.pedidos_count)
        }));

        setVentasCat(categoriasLimpias);
        setTopClientes(clientesLimpios);

    } catch (e) {
        console.error("Error cargando reportes", e);
        setVentasCat([]);
        setTopClientes([]);
    }
  }

  // CORRECCIÓN 2: Función auxiliar para formatear dinero de forma segura
  const formatoDinero = (valor) => {
      // Convierte a número, si es null o undefined usa 0, luego formatea
      return `$${Number(valor || 0).toFixed(2)}`;
  };

const exportarExcel = async () => {
    try {
        // 1. Avisar al usuario (opcional, podrías poner un estado de carga)
        alert("Generando reporte detallado, por favor espere...");

        // 2. Obtenemos los datos detallados frescos del backend
        const detalleVentas = await obtenerReporteDetallado(fechaInicio, fechaFin);

        const wb = XLSX.utils.book_new();

        // --- HOJA 1: RESUMEN CATEGORÍAS ---
        // Preparamos datos bonitos para excel
        const datosCat = ventasCat.map(item => ({
            "Categoría": item.etiqueta,
            "Cantidad Vendida": item.cantidad,
            "Total ($)": Number(item.valor) // Aseguramos número para que Excel sume
        }));
        const wsCat = XLSX.utils.json_to_sheet(datosCat);
        XLSX.utils.book_append_sheet(wb, wsCat, "Resumen Categorías");

        // --- HOJA 2: TOP CLIENTES ---
        const datosClientes = topClientes.map(item => ({
            "Cliente": item.etiqueta,
            "Total Comprado ($)": Number(item.valor),
            "Pedidos Realizados": item.pedidos_count
        }));
        const wsClientes = XLSX.utils.json_to_sheet(datosClientes);
        XLSX.utils.book_append_sheet(wb, wsClientes, "Top Clientes");

        // --- HOJA 3: DETALLE TRANSACCIONAL (NUEVO) ---
        const datosDetalle = detalleVentas.map(item => ({
            "ID Pedido": item.pedido_id,
            "Fecha": item.fecha,
            "Cliente": item.cliente,
            "Correo": item.correo,
            "Producto": item.producto,
            "Categoría": item.categoria || "Sin Categoría",
            "Precio Unit.": Number(item.precio_unitario),
            "Cantidad": Number(item.cantidad),
            "Subtotal ($)": Number(item.subtotal)
        }));
        const wsDetalle = XLSX.utils.json_to_sheet(datosDetalle);
        
        // Ajustar ancho de columnas para que se vea bien (Opcional pero recomendado)
        const wscols = [
            {wch: 10}, // A: ID
            {wch: 15}, // B: Fecha
            {wch: 25}, // C: Cliente
            {wch: 25}, // D: Correo
            {wch: 30}, // E: Producto
            {wch: 20}, // F: Categoria
            {wch: 12}, // G: Precio
            {wch: 10}, // H: Cantidad
            {wch: 15}  // I: Subtotal
        ];
        wsDetalle['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle Completo");

        // 4. Descargar
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `Reporte_KB_Collection_${fechaInicio}.xlsx`);

    } catch (error) {
        console.error("Error exportando excel:", error);
        alert("Hubo un error al generar el reporte detallado.");
    }
  };
  return (
    <div className="admin-reportes">
      <div className="header-reportes">
        <h2>📊 Reportes de Ventas</h2>
        
        <div className="controles-reporte">
            <div className="filtro-fecha">
                <FaCalendarAlt />
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                <span>a</span>
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <button className="btn-excel" onClick={exportarExcel}>
                <FaFileExcel /> Exportar Reporte
            </button>
        </div>
      </div>

      <div className="grid-graficas">
        
        {/* GRÁFICA 1: VENTAS POR CATEGORÍA */}
        <div className="card-grafica">
            <h3><FaChartPie className="icon-title"/> Ventas por Categoría ($)</h3>
            <div style={{ width: "100%", height: 300 }}>
                {ventasCat.length > 0 ? (
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie 
                                data={ventasCat} 
                                dataKey="valor" 
                                nameKey="etiqueta" 
                                cx="50%" cy="50%" 
                                outerRadius={80} 
                                label
                            >
                                {ventasCat.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                ))}
                            </Pie>
                            {/* CORRECCIÓN 3: Usar la función segura en el tooltip */}
                            <Tooltip formatter={(value) => formatoDinero(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className="no-data">No hay datos en este rango</p>}
            </div>
        </div>

        {/* GRÁFICA 2: TOP CLIENTES */}
        <div className="card-grafica">
            <h3><FaTrophy className="icon-title"/> Top Clientes</h3>
            <div style={{ width: "100%", height: 300 }}>
                {topClientes.length > 0 ? (
                    <ResponsiveContainer>
                        <BarChart data={topClientes} layout="vertical" margin={{left: 20}}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="etiqueta" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                            
                            {/* CORRECCIÓN 4: Usar la función segura en el tooltip */}
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{background:'#1e293b', border:'none', color:'white'}}
                                formatter={(value) => formatoDinero(value)}
                            />
                            <Bar dataKey="valor" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="no-data">No hay datos en este rango</p>}
            </div>
        </div>

      </div>

      {/* TABLA RESUMEN */}
      <div className="tabla-resumen-container">
          <h3>Detalle de Ventas por Categoría</h3>
          <table className="tabla-resumen">
              <thead>
                  <tr>
                      <th>Categoría</th>
                      <th>Items Vendidos</th>
                      <th>Total Generado</th>
                  </tr>
              </thead>
              <tbody>
                  {ventasCat.length > 0 ? (
                      ventasCat.map((c, i) => (
                          <tr key={i}>
                              <td>{c.etiqueta}</td>
                              <td>{c.cantidad}</td>
                              {/* CORRECCIÓN 5: Usar la función segura en la tabla */}
                              <td style={{fontWeight:'bold', color:'#22c55e'}}>
                                  {formatoDinero(c.valor)}
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr><td colSpan="3" style={{textAlign:'center'}}>No hay datos</td></tr>
                  )}
              </tbody>
          </table>
      </div>

    </div>
  );
}   