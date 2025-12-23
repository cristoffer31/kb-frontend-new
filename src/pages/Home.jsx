import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFire, FaStar, FaShippingFast, FaBoxOpen, FaLock, FaCheckCircle } from "react-icons/fa"; 

// Componentes
import ProductCard from "../components/ProductCard";
import Carousel from "../components/Carousel";
import ProductModal from "../components/ProductModal"; 
// 1. Asegúrate de que este import esté presente (ya lo tenías)
import Nosotros from '../components/Nosotros';

// Servicios
import { listarProductos, listarOfertas } from "../services/productoService";
import { listarCategorias } from "../services/categoriaService";

import "./Home.css";

const BASE_URL = import.meta.env.VITE_STORAGE_URL || "http://127.0.0.1:8000/storage/";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carga de datos inicial
    const fetchData = async () => {
      try {
        const [resProds, resOfertas, resCats] = await Promise.all([
          listarProductos(),
          listarOfertas(),
          listarCategorias()
        ]);
        
        // --- CORRECCIÓN AQUÍ ---
        
        // 1. Productos: Verificamos si vienen paginados (.data.data) o simples (.data)
        const prodsData = resProds.data;
        if (prodsData && prodsData.data && Array.isArray(prodsData.data)) {
             setProductos(prodsData.data); // Caso Paginación (Laravel paginate)
        } else if (Array.isArray(prodsData)) {
             setProductos(prodsData);      // Caso Lista simple (Laravel get)
        } else {
             setProductos([]);             // Por seguridad, si falla
        }

        // 2. Ofertas: Misma lógica
        const ofertasData = resOfertas.data;
        if (ofertasData && ofertasData.data && Array.isArray(ofertasData.data)) {
             setOfertas(ofertasData.data);
        } else if (Array.isArray(ofertasData)) {
             setOfertas(ofertasData);
        } else {
             setOfertas([]);
        }

        // 3. Categorías
        const catsData = resCats.data;
        setCategorias(Array.isArray(catsData) ? catsData : []);
        
      } catch (err) {
        console.error("Error al cargar datos de la Home:", err);
      }
    };
    fetchData();
  }, []);

  const getImagenUrl = (img) => {
    if (!img) return "https://via.placeholder.com/150?text=No+Image";
    if (img.startsWith("http")) return img;
    return `${BASE_URL}${img}`;
  };

  const productosDisponibles = productos.filter((p) => (p.stock || 0) > 0);

  return (
    <div className="home-wrapper">
      
      {/* 1. HERO SECTION */}
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-left">
            <img 
              src="/kb_logo_M.png" 
              alt="KB Collection" 
              className="hero-logo-img"
            />
            <p className="hero-text">
              Encuentra los mejores productos de higiene y cuidado personal. 
              Precios especiales por mayoreo y envíos accesibles para tu negocio.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-hero" onClick={() => navigate("/productos")}>
                Comprar Ahora
              </button>
            </div>
          </div>

          <div className="home-hero-right">
            <div className="hero-info-grid">
              <div className="info-item"><FaShippingFast className="info-icon"/> <div><h3>Envíos Rápidos</h3><p>Zonas seleccionadas</p></div></div>
              <div className="info-item"><FaBoxOpen className="info-icon"/> <div><h3>Precios Mayoreo</h3><p>Ideal para invertir</p></div></div>
              <div className="info-item"><FaLock className="info-icon"/> <div><h3>Pago Seguro</h3><p>Tarjetas</p></div></div>
              <div className="info-item"><FaCheckCircle className="info-icon"/> <div><h3>Calidad</h3><p>Producto Garantizado</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        
        {/* 2. CATEGORÍAS */}
        <section className="categories-section">
          <div className="section-header-centered">
            <h2 className="section-title-modern">Explora por Categoría</h2>
            <div className="title-underline"></div>
          </div>
          
          <div className="categories-grid">
            {categorias.map(cat => (
              <div key={cat.id} className="category-item-modern" onClick={() => navigate(`/productos?cat=${cat.id}`)}>
                <div className="category-image-wrapper">
                  {cat.imagen || cat.imagenUrl ? (
                    <img 
                      src={getImagenUrl(cat.imagen || cat.imagenUrl)} 
                      alt={cat.nombre} 
                      className="category-img"
                    />
                  ) : (
                    <div className="category-icon-placeholder">{cat.nombre?.charAt(0)}</div>
                  )}
                </div>
                <h3 className="category-name">{cat.nombre}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* 3. OFERTAS RELÁMPAGO */}
        {ofertas.length > 0 && (
          <section className="ofertas-container-pro">
            <div className="ofertas-header">
              <h2 className="ofertas-title">
                <FaFire className="fire-icon-anim" /> Ofertas Relámpago
              </h2>
              <p>¡Precios increíbles por tiempo limitado!</p>
            </div>
            <div className="product-grid-layout">
              {ofertas.map(p => (
                <div key={p.id} onClick={() => setProductoSeleccionado(p)} className="product-card-wrapper">
                  <ProductCard producto={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. CARRUSEL PUBLICITARIO */}
        <div className="home-carousel-spacer">
          <Carousel />
        </div>

        {/* 5. SECCIÓN NOSOTROS (NUEVO) */}
        {/* Aquí insertamos el componente que acabamos de crear */}
        <Nosotros />
      
        {/* 6. LO MÁS VENDIDO */}
        <section className="trending-section">
          <div className="section-header-flex">
            <h2 className="trending-title">
              <FaStar className="star-icon" /> Lo Más Vendido
            </h2>
            <button className="btn-view-all" onClick={() => navigate("/productos")}>
              Ver catálogo completo →
            </button>
          </div>
          <div className="product-grid-layout">
            {productosDisponibles.slice(0, 8).map(p => (
              <div key={p.id} onClick={() => setProductoSeleccionado(p)} className="product-card-wrapper">
                <ProductCard producto={p} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {productoSeleccionado && (
        <ProductModal 
          producto={productoSeleccionado} 
          onClose={() => setProductoSeleccionado(null)} 
        />
      )}
    </div>
  );
}