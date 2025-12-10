import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { adminListarPedidos } from "./services/adminPedidoService";
import { listarProductos } from "../services/productoService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FaDollarSign, FaShoppingBag, FaExclamationTriangle, FaPlusCircle, FaClipboardList } from "react-icons/fa";
import "./AdminDashboard.css";

const COLORS = ['#38bdf8', '#4ade80', '#fb923c', '#ef4444'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ventas: 0, pedidosCount: 0, productosBajos: [], graficaData: [], estadosData: [] 
  });
  const [cargando, setCargando] = useState(true); // Nuevo estado de carga

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [pedidos, prodRes] = await Promise.all([
            adminListarPedidos(),
            listarProductos()
        ]);

        const listaPedidos = Array.isArray(pedidos) ? pedidos : [];
        const listaProductos = prodRes?.content || (Array.isArray(prodRes) ? prodRes : []);

        // 1. VENTAS
        const ventasTotales = listaPedidos
            .filter(p => p.status !== "CANCELADO")
            .reduce((acc, p) => acc + p.total, 0);

        // 2. STOCK
        const bajosStock = listaProductos.filter(p => p.stock < 10);

        // 3. GRÁFICA BARRAS
        const datosGrafica = listaPedidos.slice(0, 10).reverse().map(p => ({ name: `Ped #${p.id}`, total: p.total }));

        // 4. GRÁFICA PASTEL
        const conteoEstados = listaPedidos.reduce((acc, p) => {
            const estado = p.status || "PENDIENTE";
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});

        const datosEstados = Object.keys(conteoEstados).map(key => ({ name: key, value: conteoEstados[key] }));

        setStats({
            ventas: ventasTotales,
            pedidosCount: listaPedidos.length,
            productosBajos: bajosStock,
            graficaData: datosGrafica,
            estadosData: datosEstados
        });
      } catch (error) { 
        console.error(error); 
      } finally {
        setCargando(false); // Terminó de cargar
      }
    }
    cargarDatos();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="header-dashboard">
          <h2>📊 Panel de Control</h2>
          <div className="accesos-rapidos">
              <button onClick={() => navigate("/admin/productos")} className="btn-accion"><FaPlusCircle /> Nuevo Producto</button>
              <button onClick={() => navigate("/admin/pedidos")} className="btn-accion secondary"><FaClipboardList /> Ver Pedidos</button>
          </div>
      </div>

      <div className="dashboard-cards">
        <div className="d-card blue"><div className="icon"><FaDollarSign /></div><div className="info"><h3>Ingresos</h3><p>${stats.ventas.toFixed(2)}</p></div></div>
        <div className="d-card green"><div className="icon"><FaShoppingBag /></div><div className="info"><h3>Pedidos</h3><p>{stats.pedidosCount}</p></div></div>
        <div className="d-card orange"><div className="icon"><FaExclamationTriangle /></div><div className="info"><h3>Stock Bajo</h3><p>{stats.productosBajos.length}</p></div></div>
      </div>

      <div className="dashboard-grid">
        {/* GRÁFICA BARRAS */}
        <div className="chart-box main-chart">
            <h3>Tendencia de Ventas</h3>
            <div style={{ width: "100%", height: 300, position: "relative" }}>
                {!cargando && stats.graficaData.length > 0 ? (
                    /* debounce={100} ayuda a que espere a que el contenedor tenga tamaño */
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <BarChart data={stats.graficaData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', border:'none', borderRadius:'8px', color:'#fff'}} />
                            <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Venta ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign:'center', color:'#64748b', marginTop:'100px'}}>
                        {cargando ? "Cargando datos..." : "No hay datos de ventas aún"}
                    </p>
                )}
            </div>
        </div>

        {/* GRÁFICA PASTEL */}
        <div className="chart-box pie-chart-box">
            <h3>Estado de Pedidos</h3>
            <div style={{ width: "100%", height: 300, position: "relative" }}>
                {!cargando && stats.estadosData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <PieChart>
                            <Pie data={stats.estadosData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {stats.estadosData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', border:'none'}} />
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign:'center', color:'#64748b', marginTop:'100px'}}>
                        {cargando ? "..." : "Sin pedidos"}
                    </p>
                )}
            </div>
        </div>

        {/* ALERTA STOCK */}
        <div className="stock-alert-box full-width">
            <h3>⚠️ Alerta de Inventario</h3>
            <table className="mini-table">
                <thead><tr><th>Producto</th><th>Stock</th></tr></thead>
                <tbody>
                    {stats.productosBajos.slice(0, 5).map(p => (
                        <tr key={p.id}><td>{p.nombre}</td><td className="danger-text">{p.stock}</td></tr>
                    ))}
                </tbody>
            </table>
            {stats.productosBajos.length === 0 && !cargando && (
                <p className="ok-text">¡Excelente! Todo el inventario tiene buen nivel. ✅</p>
            )}
        </div>
      </div>
    </div>
  );
}