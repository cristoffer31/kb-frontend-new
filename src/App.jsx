import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; 

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Carrito from "./pages/Carrito.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Checkout from "./pages/Checkout.jsx"; 
import MisPedidos from "./pages/MisPedidos.jsx";
import Ofertas from "./pages/Ofertas.jsx";
import Verificar from "./pages/Verificar.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminProductos from "./admin/AdminProductos.jsx";
import AdminCategorias from "./admin/AdminCategorias.jsx";
import AdminInventario from "./admin/AdminInventario.jsx";
import AdminPedidos from "./admin/AdminPedidos.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminCupones from "./admin/AdminCupones.jsx";

import { RequireAuth } from "./components/RequireAuth.jsx";
import { RequireAdmin } from "./components/RequireAdmin.jsx";

import Recuperar from "./pages/Recuperar.jsx";
import Restablecer from "./pages/Restablecer.jsx";
import Perfil from "./pages/Perfil.jsx";
import Contacto from "./pages/Contacto.jsx";
import AdminCarousel from "./admin/AdminCarousel.jsx";

import AdminZonas from "./admin/AdminZonas.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";

function App() {
  const location = useLocation();
  
  // Detectar si estamos en una ruta de administrador
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      
      {/* Solo mostramos Navbar si NO es admin */}
      {!isAdminRoute && <Navbar />}

      {/* Si es admin, quitamos la clase app-main para que use su propio layout completo */}
      <main className={isAdminRoute ? "" : "app-main"}>
        <Routes>
          {/* --- PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verificar" element={<Verificar />} />
          
          {/* Recuperación de contraseña */}
          <Route path="/recuperar" element={<Recuperar />} />
          <Route path="/restablecer" element={<Restablecer />} />

          {/* --- PRIVADAS (Requieren Login) --- */}
          <Route path="/carrito" element={<RequireAuth><Carrito /></RequireAuth>} />
          <Route path="/mis-pedidos" element={<RequireAuth><MisPedidos /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
          
          {/* CONTACTO AHORA ES PRIVADO */}
          <Route 
            path="/contacto" 
            element={
              <RequireAuth>
                <Contacto />
              </RequireAuth>
            } 
          />

          {/* --- ADMIN (Rutas protegidas) --- */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>}/>
          <Route path="/admin/productos" element={<RequireAdmin><AdminLayout><AdminProductos /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/categorias" element={<RequireAdmin><AdminLayout><AdminCategorias /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/inventario" element={<RequireAdmin><AdminLayout><AdminInventario /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/pedidos" element={<RequireAdmin><AdminLayout><AdminPedidos /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/cupones" element={<RequireAdmin><AdminLayout><AdminCupones /></AdminLayout></RequireAdmin>} />

<Route path="/admin/carousel" element={<RequireAdmin><AdminLayout><AdminCarousel /></AdminLayout></RequireAdmin>} />

<Route path="/admin/zonas" element={<RequireAdmin><AdminLayout><AdminZonas /></AdminLayout></RequireAdmin>} />
<Route path="/admin/usuarios" element={<RequireAdmin><AdminLayout><AdminUsuarios /></AdminLayout></RequireAdmin>} />

        </Routes>
      </main>

      {/* Solo mostramos Footer si NO es admin */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;