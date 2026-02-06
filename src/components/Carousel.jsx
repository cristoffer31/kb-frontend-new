import { useState, useEffect } from "react";
import api from "../services/api"; // Usamos la API directamente
import "./Carousel.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Carousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [cargando, setCargando] = useState(true);

  // Cargar imágenes del servidor
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get("/carousel"); // OJO: Ver punto 2 abajo sobre la ruta
        
        // --- CORRECCIÓN AQUÍ ---
        // Verificamos explícitamente si es un ARRAY
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSlides(res.data);
        } else {
          // Si devuelve texto, objeto u otra cosa rara, usamos el fallback
          console.warn("La API no devolvió una lista válida:", res.data);
          throw new Error("Formato inválido"); // Forzamos ir al catch
        }

      } catch (error) {
        console.error("Error cargando carrusel", error);
        // Fallback (Tus imágenes por defecto)
        setSlides([
            { id: 1, imageUrl: "/banner_n1.png", titulo: "Bienvenido" },
            { id: 2, imageUrl: "/banner_n2.png", titulo: "Ofertas" }
        ]);
      } finally {
        setCargando(false);
      }
    }
    fetchBanners();
  }, []);

  // Autoplay
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 5000); // Cambia cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  if (cargando) return <div className="carousel-loading">Cargando banners...</div>;
  if (slides.length === 0) return null;

  return (
    <div className="carousel-container">
      {/* Imagenes */}
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={slide.id || index} className="carousel-slide">
            <img 
  src={slide.imageUrl?.replace('/api/storage/', '/storage/')} 
  alt={slide.titulo || "Banner"} />
            {/* Opcional: Mostrar título si existe */}
            {slide.titulo && (
                <div className="carousel-caption">
                    <h3>{slide.titulo}</h3>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Controles (Solo si hay más de 1) */}
      {slides.length > 1 && (
        <>
          <button className="carousel-btn left" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="carousel-btn right" onClick={nextSlide}>
            <FaChevronRight />
          </button>

          {/* Indicadores (Puntitos) */}
          <div className="carousel-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                onClick={() => setCurrent(i)}
                className={`dot ${current === i ? "active" : ""}`}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}