import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { 
  FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, 
  FaUserCircle, FaBoxOpen, FaSignOutAlt, FaChevronDown, FaCog 
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CarritoContext } from "../context/CarritoContext";
import { buscarProductos } from "../services/productoService";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  
  // Estado menú usuario
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Ref para controlar el tiempo de cierre
  const closeTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { usuario, isLogged, isAdmin, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CarritoContext);
  
  const searchRef = useRef(null);

  // --- FUNCIONES PARA EL MENÚ FLOTANTE (FIX) ---
  const handleMenuEnter = () => {
    // Si había un cierre pendiente, lo cancelamos porque el usuario volvió
    if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
    }
    setShowUserMenu(true);
  };

  const handleMenuLeave = () => {
    // Esperamos un poco antes de cerrar para dar tiempo a mover el mouse
    closeTimeoutRef.current = setTimeout(() => {
        setShowUserMenu(false);
    }, 300); // 300ms de gracia
  };
  // ---------------------------------------------

  // --- BUSCADOR ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim().length > 1) {
        try {
          const resultados = await buscarProductos(search);
          const lista = resultados.content || (Array.isArray(resultados) ? resultados : []);
          setSugerencias(lista.slice(0, 5)); 
          setMostrarSugerencias(true);
        } catch (error) { setSugerencias([]); }
      } else {
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/productos?buscar=${encodeURIComponent(search)}`);
      setOpen(false); setMostrarSugerencias(false);
    }
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const irAProducto = (id) => {
    navigate(`/producto/${id}`);
    setSearch(""); setMostrarSugerencias(false); setOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="topbar">
        Envíos rápidos • Productos premium de higiene y estilo
      </div>

      <nav className="navbar">
        <Link className="navbar-logo" to="/">
          <img src="/kb_logo_M.png" alt="KB Collection" className="navbar-logo-img" />
        </Link>

        <div className="navbar-search" ref={searchRef}>
          <div className="search-wrapper">
            <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => search.length > 1 && setMostrarSugerencias(true)}
            />
            <button className="search-btn" onClick={handleSearch}><FaSearch /></button>
          </div>

          {mostrarSugerencias && sugerencias.length > 0 && (
            <div className="sugerencias-box">
                {sugerencias.map((prod) => (
                    <div key={prod.id} className="sugerencia-item" onClick={() => irAProducto(prod.id)}>
                        <img src={prod.imagenUrl || "/placeholder.png"} alt={prod.nombre} />
                        <div className="sugerencia-info">
                            <span className="s-nombre">{prod.nombre}</span>
                            <span className="s-precio">${Number(prod.precio).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
                <div className="ver-todos" onClick={handleSearch}>Ver todos los resultados</div>
            </div>
          )}
        </div>

        <div className={`navbar-links ${open ? "active" : ""}`}>
          <Link to="/" onClick={() => setOpen(false)}>Inicio</Link>
          <Link to="/productos" onClick={() => setOpen(false)}>Tienda</Link>
          <Link to="/ofertas" onClick={() => setOpen(false)}>Ofertas</Link>
          <Link to="/contacto" onClick={() => setOpen(false)}>Contacto</Link>
          {isAdmin && <Link to="/admin" className="admin-nav-link" onClick={() => setOpen(false)}>Panel Admin</Link>}
        </div>

        <div className="navbar-icons">
          <Link to="/carrito" className="icon-btn cart-icon">
            <FaShoppingCart />
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </Link>

          {!isLogged ? (
            <Link to="/login" className="login-btn-nav">
                <FaUser /> Iniciar Sesión
            </Link>
          ) : (
            // --- MENÚ CON RETARDO ---
            <div 
                className="user-dropdown-container" 
                onMouseEnter={handleMenuEnter} 
                onMouseLeave={handleMenuLeave}
            >
              <button className="user-btn-trigger">
                  <FaUserCircle className="avatar-icon"/>
                  <span className="user-name-nav">{usuario?.nombre?.split(' ')[0]}</span>
                  <FaChevronDown className="chevron-icon"/>
              </button>

              {showUserMenu && (
                  <div className="user-dropdown-menu">
                      <div className="dropdown-header">
                          <strong>Hola, {usuario?.nombre?.split(' ')[0]}</strong>
                          <small>{usuario?.email}</small>
                      </div>
                      
                      <Link to="/perfil" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                          <FaCog /> Mi Perfil
                      </Link>
                      
                      <Link to="/mis-pedidos" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                          <FaBoxOpen /> Mis Pedidos
                      </Link>
                      
                      <div className="dropdown-divider"></div>
                      
                      <button className="dropdown-item logout" onClick={logout}>
                          <FaSignOutAlt /> Cerrar Sesión
                      </button>
                  </div>
              )}
            </div>
            // -----------------------
          )}

          <button className="hamburger" onClick={() => setOpen(!open)}>
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;