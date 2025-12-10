import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Carousel from "../components/Carousel";
import ProductModal from "../components/ProductModal"; 
import { listarProductos, listarOfertas } from "../services/productoService";
import { listarCategorias } from "../services/categoriaService";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { FaFire, FaStar } from "react-icons/fa"; 

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cargar Productos
    listarProductos()
      .then((data) => {
        const lista = data.content || (Array.isArray(data) ? data : []);
        setProductos(lista);
      })
      .catch(() => setProductos([]));

    // 2. Cargar Ofertas
    listarOfertas()
      .then((data) => setOfertas(data || []))
      .catch(() => setOfertas([]));

    // 3. Cargar Categorías
    listarCategorias()
      .then((data) => setCategorias(data || []))
      .catch(() => setCategorias([]));
  }, []);

  const productosDisponibles = Array.isArray(productos) ? productos.filter((p) => p.stock > 0) : [];

  return (
    <div className="home-wrapper">
      
      {/* 1. HERO (Portada Principal) */}
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-left">
            <span style={{textTransform:'uppercase', letterSpacing:'2px', fontSize:'0.85rem', color:'#93c5fd', fontWeight:'bold'}}>
              Tienda Oficial
            </span>
            <h1>KB COLLECTION <br/><span className="hero-highlight">INTERNACIONAL</span></h1>
            <p>Encuentra los mejores productos de higiene y cuidado personal. Precios especiales por mayoreo y envios accesibles.</p>
            
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/productos")} style={{padding:'14px 32px', fontSize:'1.1rem'}}>
                Comprar Ahora
              </button>
            </div>
          </div>

          <div className="home-hero-right">
             <div className="hero-info-cards">
                <div className="info-card">
                    <h3>🚀 Envíos Rápidos</h3>
                    <p>Contamos con envios en zonas seleccionadas</p>
                </div>
                <div className="info-card">
                    <h3>📦 Precios Mayoreo</h3>
                    <p>Precios accesibles para invertir en tu negocio</p>
                </div>
                <div className="info-card">
                    <h3>🔒 Pago Seguro</h3>
                    <p>Aceptamos PayPal y Tarjetas.</p>
                </div>
                <div className="info-card">
                    <h3>⭐ Calidad</h3>
                    <p>Productos originales garantizados.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      <div className="container">
        
    
      {/* 2. CATEGORÍAS */}
      <section className="categories-section">
        <div className="container">
            <h2 className="section-title">Explora por Categoría</h2>
            
            <div className="categories-grid">
                {categorias.map(cat => (
                    <div key={cat.id} className="category-card-modern" onClick={() => navigate(`/productos?cat=${cat.id}`)}>
                        
                        {/* SI TIENE IMAGEN, LA MOSTRAMOS. SI NO, USAMOS EL ICONO DE LETRA */}
                        {cat.imagenUrl ? (
                            <img 
                                src={cat.imagenUrl} 
                                alt={cat.nombre} 
                                style={{
                                    width:'80px', height:'80px', borderRadius:'50%', 
                                    objectFit:'cover', marginBottom:'15px',
                                    border:'3px solid #e0f2fe'
                                }} 
                            />
                        ) : (
                            <div className="cat-icon-modern">
                                {cat.nombre.charAt(0)}
                            </div>
                        )}

                        <h3>{cat.nombre}</h3>
                    </div>
                ))}
            </div>
        </div>
      </section>

        {/* 3. OFERTAS RELÁMPAGO (Diseño Destacado PRO con tamaño normal) */}
        {ofertas.length > 0 && (
            <section className="ofertas-section-pro">
                <h2 className="section-title-center" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', color:'#be123c'}}>
                    <FaFire className="fire-icon-anim" style={{color:'#f43f5e'}} /> Ofertas Relámpago
                </h2>
                <p className="section-subtitle" style={{color:'#fda4af'}}>¡Precios increíbles por tiempo limitado!</p>
                
                {/* Usamos la nueva clase product-grid-normal */}
                <div className="product-grid-normal">
                    {ofertas.map(p => (
                        <div key={p.id} onClick={() => setProductoSeleccionado(p)} style={{cursor:'pointer'}}>
                            <ProductCard producto={p} />
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* 4. CARRUSEL (Banners) */}
        <div style={{margin: '60px 0'}}>
            <Carousel />
        </div>

        {/* 5. LO MÁS VENDIDO */}
        <section className="mas-vendido-section">
            <div className="section-header-flex">
                <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaStar style={{color:'#eab308'}} /> Lo Más Vendido
                </h2>
                <button className="link-ver-todo" onClick={() => navigate("/productos")}>
                    Ver catálogo completo →
                </button>
            </div>

            {/* Reusamos la misma clase de grid normal */}
            <div className="product-grid-normal">
                {productosDisponibles.slice(0, 8).map(p => (
                    <div key={p.id} onClick={() => setProductoSeleccionado(p)} style={{cursor:'pointer'}}>
                        <ProductCard producto={p} />
                    </div>
                ))}
            </div>
        </section>

      </div>

      {/* MODAL FLOTANTE */}
      {productoSeleccionado && (
        <ProductModal 
            producto={productoSeleccionado} 
            onClose={() => setProductoSeleccionado(null)} 
        />
      )}
    </div>
  );
}