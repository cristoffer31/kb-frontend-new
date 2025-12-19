import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { adminListarPedidos } from "./services/adminPedidoService";
import { listarProductos } from "../services/productoService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// ICONOS IMPORTADOS (Se agregó FaCreditCard aquí)
import { 
  FaDollarSign, FaShoppingBag, FaExclamationTriangle, FaPlusCircle, 
  FaClipboardList, FaBoxOpen, FaChartLine, FaTicketAlt, FaCreditCard 
} from "react-icons/fa";

import "./AdminDashboard.css";

const COLORS = ['#be123c','#dea919da', '#d841ceff', '#10b981', '#f59e0b' ];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ventas: 0, 
    pedidosCount: 0, 
    productosBajos: [], 
    graficaData: [], 
    estadosData: [],
    ticketPromedio: 0,
    tasaCupones: 0,
    pendientesBAC: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [pedidos, prodRes] = await Promise.all([
            adminListarPedidos(),
            listarProductos()
        ]);

        const listaPedidos = Array.isArray(pedidos) ? pedidos : (pedidos?.data || []);
        const listaProductos = prodRes?.content || prodRes?.data || (Array.isArray(prodRes) ? prodRes : []);

        // --- 1. PROCESAMIENTO DE STOCK (Menos de 20) ---
        const bajosStock = listaProductos.filter(p => {
            const stockActual = Number(p.stock);
            return stockActual < 20;
        }).sort((a, b) => Number(a.stock) - Number(b.stock));

        // --- 2. VENTAS E INSIGHTS (Filtro de estados reales) ---
        const pedidosValidos = listaPedidos.filter(p => 
          !["CANCELADO", "PENDIENTE DE PAGO"].includes((p.estado || "").toUpperCase())
        );

        const ventasTotales = pedidosValidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
        
        // Ticket Promedio (Insight)
        const avgTicket = pedidosValidos.length > 0 ? (ventasTotales / pedidosValidos.length) : 0;

        // Tasa de Cupones (Insight)
        const conCupon = listaPedidos.filter(p => p.codigo_cupon).length;
        const tasaC = listaPedidos.length > 0 ? (conCupon / listaPedidos.length) * 100 : 0;

        // Pendientes BAC (Conteo para tarjeta de alerta)
        const bacCount = listaPedidos.filter(p => (p.estado || "").toUpperCase() === "PENDIENTE DE PAGO").length;

        // --- 3. GRÁFICA BARRAS (Últimos 10 pedidos válidos) ---
        const datosGrafica = pedidosValidos
            .slice(0, 10)
            .reverse()
            .map(p => ({ 
                name: `Ord #${p.id}`, 
                total: Number(p.total || 0) 
            }));

        // --- 4. GRÁFICA PASTEL ---
        const conteoEstados = listaPedidos.reduce((acc, p) => {
            const estado = (p.estado || "PENDIENTE").toUpperCase();
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});

        const datosEstados = Object.keys(conteoEstados).map(key => ({ name: key, value: conteoEstados[key] }));

        setStats({
            ventas: ventasTotales,
            pedidosCount: listaPedidos.length,
            productosBajos: bajosStock,
            graficaData: datosGrafica,
            estadosData: datosEstados,
            ticketPromedio: avgTicket,
            tasaCupones: tasaC,
            pendientesBAC: bacCount
        });
      } catch (error) { 
        console.error("Error cargando dashboard:", error); 
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="header-dashboard">
          <h2>📊 Panel de Control</h2>
          <div className="accesos-rapidos">
              <button onClick={() => navigate("/admin/productos")} className="btn-accion">
                  <FaPlusCircle /> Nuevo Producto
              </button>
              <button onClick={() => navigate("/admin/pedidos")} className="btn-accion secondary">
                  <FaClipboardList /> Ver Pedidos
              </button>
          </div>
      </div>

      <div className="dashboard-cards">
        {/* INGRESOS */}
        <div className="d-card blue">
            <div className="icon"><FaDollarSign /></div>
            <div className="info">
                <h3>Ingresos Confirmados</h3>
                <p>${Number(stats.ventas).toFixed(2)}</p> 
            </div>
        </div>

        {/* TICKET PROMEDIO */}
        <div className="d-card purple">
            <div className="icon"><FaChartLine /></div>
            <div className="info">
                <h3>Ticket Promedio</h3>
                <p>${stats.ticketPromedio.toFixed(2)}</p>
            </div>
        </div>
        
        {/* PENDIENTES BAC (Icono ahora definido) */}
        <div className={`d-card ${stats.pendientesBAC > 0 ? 'red-alert' : 'green'}`}>
            <div className="icon"><FaCreditCard /></div>
            <div className="info">
                <h3>Pendientes BAC</h3>
                <p>{stats.pendientesBAC}</p>
            </div>
        </div>

        {/* USO DE CUPONES */}
        <div className="d-card cyan">
            <div className="icon"><FaTicketAlt /></div>
            <div className="info">
                <h3>Uso de Cupones</h3>
                <p>{stats.tasaCupones.toFixed(1)}%</p>
            </div>
        </div>

        {/* STOCK BAJO */}
        <div className="d-card orange">
            <div className="icon"><FaExclamationTriangle /></div>
            <div className="info">
                <h3>Stock Bajo</h3>
                <p>{stats.productosBajos.length}</p>
            </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-box main-chart">
            <h3>Tendencia de Ventas (Últimos 10 Pagados)</h3>
            <div style={{ width: "100%", height: 300 }}>
                {!cargando && stats.graficaData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.graficaData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color:'#f1f5f9'}} 
                                itemStyle={{color: '#38bdf8'}}
                            />
                            <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Monto ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="no-data-msg">{cargando ? "Cargando..." : "Sin ventas recientes"}</p>
                )}
            </div>
        </div>

        <div className="chart-box pie-chart-box">
            <h3>Distribución de Pedidos</h3>
            <div style={{ width: "100%", height: 300 }}>
                {!cargando && stats.estadosData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={stats.estadosData} 
                                cx="50%" cy="50%" 
                                innerRadius={60} outerRadius={80} 
                                paddingAngle={5} dataKey="value"
                            >
                                {stats.estadosData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color:'#f1f5f9'}} />
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="no-data-msg">Sin datos</p>
                )}
            </div>
        </div>

        <div className="stock-alert-box full-width">
            <h3>⚠️ Alerta de Inventario (Menos de 20)</h3>
            <div className="table-responsive">
                <table className="mini-table">
                    <thead><tr><th>Producto</th><th>Stock Actual</th></tr></thead>
                    <tbody>
                        {stats.productosBajos.length > 0 ? (
                            stats.productosBajos.map(p => (
                                <tr key={p.id}>
                                    <td><FaBoxOpen style={{marginRight:'5px', color:'#64748b'}}/> {p.nombre}</td>
                                    <td className="danger-text" style={{fontWeight:'bold', color: Number(p.stock) <= 5 ? '#ef4444' : '#fb923c'}}>
                                        {p.stock}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="2" style={{textAlign:'center', padding:'20px'}}>Todo el inventario está saludable ✅</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}