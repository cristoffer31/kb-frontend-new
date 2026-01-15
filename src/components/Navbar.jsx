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
  
  // Refs
  const closeTimeoutRef = useRef(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null); // Nuevo ref para click outside del menú usuario

  const navigate = useNavigate();
  const { usuario, isLogged, isAdmin, logout } = useContext(AuthContext);
  const { cantidadTotal } = useContext(CarritoContext); // Usamos cantidadTotal (nombre correcto del nuevo contexto)
  
  // --- CONTROL DEL MENÚ FLOTANTE ---
  const handleMenuEnter = () => {
    if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
    }
    setShowUserMenu(true);
  };

  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
        setShowUserMenu(false);
    }, 300); 
  };

  // Cerrar menú si clickean fuera (útil en móvil)
  useEffect(() => {
    function handleClickOutsideMenu(event) {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
            setShowUserMenu(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, []);
  // ---------------------------------------------

  // --- BUSCADOR INTELIGENTE ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim().length > 1) {
        try {
          const resultados = await buscarProductos(search);
          // Normalización para Laravel
          const lista = resultados.data || (Array.isArray(resultados) ? resultados : []);
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

  // Cerrar sugerencias al clickear fuera
  useEffect(() => {
    function handleClickOutsideSearch(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      setOpen(false); 
    setMostrarSugerencias(false);
    navigate(`/productos?buscar=${encodeURIComponent(search)}`);
      setSearch("");
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  
  const irAProducto = (id) => {
    navigate(`/producto/${id}`);
    setSearch(""); 
    setMostrarSugerencias(false); 
    setOpen(false);
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

        {/* BUSCADOR */}
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
                        <img src={prod.imagenUrl || prod.imagen || "/placeholder.png"} alt={prod.nombre} />
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

        {/* MENÚ MÓVIL / DESKTOP */}
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
            {cantidadTotal > 0 && <span className="badge">{cantidadTotal}</span>}
          </Link>

          {!isLogged ? (
            <Link to="/login" className="login-btn-nav">
                <FaUser /> Iniciar Sesión
            </Link>
          ) : (
            // MENÚ USUARIO DESPLEGABLE
            <div 
                className="user-dropdown-container" 
                ref={userMenuRef}
                onMouseEnter={handleMenuEnter} 
                onMouseLeave={handleMenuLeave}
                onClick={() => setShowUserMenu(!showUserMenu)} // Click para móvil
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
                      
                      <button className="dropdown-item logout" onClick={() => { logout(); setShowUserMenu(false); }}>
                          <FaSignOutAlt /> Cerrar Sesión
                      </button>
                  </div>
              )}
            </div>
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