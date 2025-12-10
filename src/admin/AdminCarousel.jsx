import React, { useEffect, useState } from "react";
import { listarCarousel, crearCarousel, eliminarCarousel } from "./services/adminCarouselService";
import { FaTrash, FaImage } from "react-icons/fa";
import "./AdminCarousel.css";

export default function AdminCarousel() {
  const [imagenes, setImagenes] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    try {
        const data = await listarCarousel();
        setImagenes(data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!archivo) return alert("Selecciona una imagen");
    
    setCargando(true);
    try {
        await crearCarousel(archivo, titulo);
        setTitulo("");
        setArchivo(null);
        document.getElementById("fileInput").value = ""; // Limpiar input
        cargar();
    } catch (e) {
        alert("Error al subir imagen");
    } finally {
        setCargando(false);
    }
  }

  async function borrar(id) {
    if(confirm("¿Eliminar este banner?")) {
        await eliminarCarousel(id);
        cargar();
    }
  }

  return (
    <div className="admin-carousel">
      <h2>🖼️ Gestión de Carrusel</h2>

      <form className="carousel-form" onSubmit={handleSubmit}>
        <input 
            type="text" 
            placeholder="Título (Opcional)" 
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
        />
        <input 
            id="fileInput"
            type="file" 
            accept="image/*"
            onChange={e => setArchivo(e.target.files[0])}
            required
        />
        <button type="submit" disabled={cargando}>
            {cargando ? "Subiendo..." : "Subir Banner"}
        </button>
      </form>

      <div className="banners-grid">
        {imagenes.map(img => (
            <div key={img.id} className="banner-card">
                <img src={img.imageUrl} alt="banner" />
                <div className="banner-info">
                    <span>{img.titulo || "Sin título"}</span>
                    <button onClick={() => borrar(img.id)} className="btn-trash">
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}