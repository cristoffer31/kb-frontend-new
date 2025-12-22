import React from 'react';
import './Nosotros.css';
// CORRECCIÓN AQUÍ: FaBullseye (B mayúscula)
import { FaRegEye, FaBullseye, FaHistory, FaTachometerAlt } from 'react-icons/fa';

export default function Nosotros() {
  
  const datos = [
    {
      titulo: "Misión",
      icono: <FaTachometerAlt />, 
      imagen: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop", 
      texto: "Satisfacer las necesidades de nuestros clientes y darnos como alternativa de solución para ellos, brindando un servicio de calidad a precios competitivos; manteniendo su confianza y contribuyendo al desarrollo de nuestra comunidad."
    },
    {
      titulo: "Nuestros Planes",
      icono: <FaBullseye />, // Usamos el icono corregido aquí
      imagen: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop",
      texto: "KB Collection Internacional, siempre ha tenido la convicción de dar un buen servicio con productos de alta calidad a un precio competitivo, somos una empresa 100% salvadoreña especializada en cosméticos y el cuidado de toda tu familia."
    },
    {
      titulo: "Visión",
      icono: <FaRegEye />, 
      imagen: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1470&auto=format&fit=crop",
      texto: "Ser una empresa con un equipo de trabajo orientado a la mejora continua, con una estructura sólida y eficiente, buscando ser una empresa competitiva; brindando productos innovadores de gran calidad y excelentes precios."
    }
  ];

  return (
    <section className="nosotros-section">
      <h2 className="nosotros-title">NOSOTROS</h2>
      <div className="nosotros-underline"></div>

      <div className="nosotros-container">
        {datos.map((item, index) => (
          <div key={index} className="nosotros-card">
            
            {/* Imagen Superior */}
            <div className="card-image-container">
              <img src={item.imagen} alt={item.titulo} className="card-image" />
              {/* Icono Flotante */}
              <div className="card-icon-circle">
                {item.icono}
              </div>
            </div>

            {/* Texto Inferior */}
            <div className="card-content">
              <h3 className="card-title">{item.titulo}</h3>
              <p className="card-text">{item.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}