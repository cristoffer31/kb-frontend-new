import React, { useEffect, useState } from "react";
import { obtenerVentasPorCategoria, obtenerTopClientes } from "./services/adminReporteService";
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
        setVentasCat(resCat);
        setTopClientes(resClientes);
    } catch (e) {
        console.error("Error cargando reportes", e);
    }
  }

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Hoja 1: Categorías
    const wsCat = XLSX.utils.json_to_sheet(ventasCat);
    XLSX.utils.book_append_sheet(wb, wsCat, "Ventas por Categoría");

    // Hoja 2: Clientes
    const wsClientes = XLSX.utils.json_to_sheet(topClientes);
    XLSX.utils.book_append_sheet(wb, wsClientes, "Top Clientes");

    // Descargar
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `Reporte_Ventas_${fechaInicio}.xlsx`);
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
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* GRÁFICA 2: TOP CLIENTES */}
        <div className="card-grafica">
            <h3><FaTrophy className="icon-title"/> Top Clientes</h3>
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={topClientes} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="etiqueta" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{background:'#1e293b', border:'none', color:'white'}}
                            formatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Bar dataKey="valor" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
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
                  {ventasCat.map((c, i) => (
                      <tr key={i}>
                          <td>{c.etiqueta}</td>
                          <td>{c.cantidad}</td>
                          <td style={{fontWeight:'bold', color:'#22c55e'}}>${c.valor.toFixed(2)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

    </div>
  );
}