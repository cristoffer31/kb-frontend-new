import React, { useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import { FaBox, FaTags, FaHome, FaClipboardList, FaTruck, FaTicketAlt, FaImages, FaUsers, FaMapMarkedAlt, FaChartLine, FaCog } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import AdminBell from "./components/AdminBell"; // <--- AQUÍ ESTÁ EL CAMBIO (./)

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, isAdmin, cargandoAuth } = useContext(AuthContext);

  useEffect(() => {
    if (!cargandoAuth) {
        if (!isAdmin) {
            navigate("/");
        }
    }
  }, [isAdmin, cargandoAuth, navigate]);

  if (cargandoAuth) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
       <div className="admin-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
          <img 
            src="/kb_logo_M.png" 
            alt="KB Collection" 
            style={{ 
              height: '50px', 
              objectFit: 'contain', 
              marginBottom: '5px',
              marginLeft: '-5px' // Pequeño ajuste visual
            }} 
          />
          <span className="admin-logo-sub" style={{ color:'#fbbf24', fontSize: '0.75rem', opacity: 0.6, letterSpacing: '1px' }}>
              {usuario?.role === "SUPER_ADMIN" ? "PANEL SUPER ADMIN" : "PANEL ADMINISTRATIVO"}
          </span>
        </div>

        <nav className="admin-menu">
          <span className="admin-menu-title">Navegación</span>

          <Link to="/" className={location.pathname === "/" ? "admin-link active" : "admin-link"}>
            <FaHome /> <span>Volver a tienda</span>
          </Link>

          <span className="admin-menu-section">Gestión</span>

          <Link to="/admin" className={location.pathname === "/admin" ? "admin-link active" : "admin-link"}>
            <FaHome /> <span>Dashboard</span>
          </Link>

          <Link to="/admin/productos" className={location.pathname.startsWith("/admin/productos") ? "admin-link active" : "admin-link"}>
            <FaBox /> <span>Productos</span>
          </Link>

          <Link to="/admin/inventario" className={location.pathname.startsWith("/admin/inventario") ? "admin-link active" : "admin-link"}>
            <FaClipboardList /> <span>Inventario</span>
          </Link>
          
          <Link to="/admin/categorias" className={location.pathname.startsWith("/admin/categorias") ? "admin-link active" : "admin-link"}>
            <FaTags /> <span>Categorías</span>
          </Link>

          <Link to="/admin/pedidos" className={location.pathname.startsWith("/admin/pedidos") ? "admin-link active" : "admin-link"}>
            <FaTruck /> <span>Pedidos</span>
          </Link>

          <Link to="/admin/zonas" className={location.pathname.startsWith("/admin/zonas") ? "admin-link active" : "admin-link"}>
            <FaMapMarkedAlt /> <span>Zonas y Tarifas</span>
          </Link>

          <Link to="/admin/cupones" className={location.pathname.startsWith("/admin/cupones") ? "admin-link active" : "admin-link"}>
            <FaTicketAlt /> <span>Cupones</span>
          </Link>

          <Link to="/admin/carousel" className={location.pathname.startsWith("/admin/carousel") ? "admin-link active" : "admin-link"}>
             <FaImages /> <span>Carrusel</span>
          </Link>

          <Link to="/admin/reportes" className={location.pathname.startsWith("/admin/reportes") ? "admin-link active" : "admin-link"}>
             <FaChartLine /> <span>Reportes</span>
          </Link>

          {usuario?.role === "SUPER_ADMIN" && (
              <>
                <span className="admin-menu-section" style={{color:'#fbbf24'}}>Seguridad</span>
                <Link to="/admin/usuarios" className={location.pathname.startsWith("/admin/usuarios") ? "admin-link active" : "admin-link"}>
                    <FaUsers style={{color:'#fbbf24'}}/> <span style={{color:'#fbbf24'}}>Usuarios</span>
                </Link>
                <Link to="/admin/configuracion" className={location.pathname.startsWith("/admin/configuracion") ? "admin-link active" : "admin-link"}>
                   <FaCog style={{color:'#fbbf24'}}/> <span style={{color:'#fbbf24'}}>Configuración</span>
                </Link>
              </>
          )}

        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Panel de administración</h1>
            <p>Bienvenido, {usuario?.nombre}</p>
          </div>
          
          {/* CAMPANA DE NOTIFICACIONES */}
          <div style={{display:'flex', alignItems:'center'}}>
             <AdminBell />
          </div>
        </header>

        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}