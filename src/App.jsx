import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; 

// Componentes Globales
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";

// Páginas Públicas
import Home from "./pages/Home.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Ofertas from "./pages/Ofertas.jsx";

// Auth
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Verificar from "./pages/Verificar.jsx";
import Recuperar from "./pages/Recuperar.jsx";
import Restablecer from "./pages/Restablecer.jsx";

// Páginas Privadas
import Carrito from "./pages/Carrito.jsx";
import Checkout from "./pages/Checkout.jsx"; 
import MisPedidos from "./pages/MisPedidos.jsx";
import Perfil from "./pages/Perfil.jsx";
import Contacto from "./pages/Contacto.jsx";

// Admin
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminProductos from "./admin/AdminProductos.jsx";
import AdminCategorias from "./admin/AdminCategorias.jsx";
import AdminInventario from "./admin/AdminInventario.jsx";
import AdminPedidos from "./admin/AdminPedidos.jsx";
import AdminCupones from "./admin/AdminCupones.jsx";
import AdminCarousel from "./admin/AdminCarousel.jsx";
import AdminZonas from "./admin/AdminZonas.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";
import AdminConfiguracion from "./admin/AdminConfiguracion.jsx";
import AdminReportes from "./admin/AdminReportes.jsx";

// Guards
import { RequireAuth } from "./components/RequireAuth.jsx";
import { RequireAdmin } from "./components/RequireAdmin.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      <ScrollToTop />
      
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "" : "app-main"}>
        <Routes>
          {/* --- PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          
          {/* --- AUTENTICACIÓN --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 1. Verificación de Email */}
          <Route path="/email/verify/:id/:hash" element={<Verificar />} />
          <Route path="/verificar" element={<Verificar />} />

          {/* 2. Recuperación de Contraseña (CORREGIDO) */}
          {/* Definimos ambas para que no importe cuál llame el sistema */}
          <Route path="/recuperar" element={<Recuperar />} />
          <Route path="/auth/recuperar" element={<Recuperar />} /> 

          {/* 3. Restablecer Contraseña */}
          <Route path="/password/reset/:token" element={<Restablecer />} /> 
          <Route path="/restablecer" element={<Restablecer />} />
          <Route path="/auth/restablecer/:token" element={<Restablecer />} />

          {/* --- PRIVADAS --- */}
          <Route path="/carrito" element={<RequireAuth><Carrito /></RequireAuth>} />
          <Route path="/mis-pedidos" element={<RequireAuth><MisPedidos /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
          <Route path="/contacto" element={<RequireAuth><Contacto /></RequireAuth>} />

          {/* --- ADMIN --- */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>}/>
          <Route path="/admin/stats" element={<RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>}/>
          <Route path="/admin/productos" element={<RequireAdmin><AdminLayout><AdminProductos /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/categorias" element={<RequireAdmin><AdminLayout><AdminCategorias /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/inventario" element={<RequireAdmin><AdminLayout><AdminInventario /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/pedidos" element={<RequireAdmin><AdminLayout><AdminPedidos /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/cupones" element={<RequireAdmin><AdminLayout><AdminCupones /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/carousel" element={<RequireAdmin><AdminLayout><AdminCarousel /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/zonas" element={<RequireAdmin><AdminLayout><AdminZonas /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/usuarios" element={<RequireAdmin><AdminLayout><AdminUsuarios /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/configuracion" element={<RequireAdmin><AdminLayout><AdminConfiguracion /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/reportes" element={<RequireAdmin><AdminLayout><AdminReportes /></AdminLayout></RequireAdmin>} />

        </Routes>
      </main>

      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;