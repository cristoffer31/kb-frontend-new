import React from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* COLUMNA 1: LOGO + DESCRIPCIÓN */}
        <div className="footer-col">
          <h3 className="footer-logo">
            KB <span>COLLECTION</span>
          </h3>
          <p>
            Tienda en línea especializada en higiene, estilo y productos
            personales de calidad premium.
          </p>
          <p className="footer-copy">
            © {year} KB COLLECTION. Todos los derechos reservados.
          </p>
        </div>

        {/* COLUMNA 2: ENLACES */}
        <div className="footer-col">
          <h4>Explorar</h4>
          <a href="/">Inicio</a>
          <a href="/productos">Productos</a>
          <a href="/carrito">Mi carrito</a>
          <a href="/contacto">Contacto</a>
        </div>

        {/* COLUMNA 3: INFORMACIÓN */}
        <div className="footer-col">
          <h4>Información</h4>
          <p>Correo: soporte@kbcollection.com</p>
          <p>Teléfono: +503 7000-0000</p>
          <p>San Salvador, El Salvador</p>
        </div>

        {/* COLUMNA 4: REDES SOCIALES */}
        <div className="footer-col">
          <h4>Síguenos</h4>
          <div className="footer-socials">
            <a href="#">
              <FaFacebook />
            </a>
            <a href="#">
              <FaInstagram />
            </a>
            <a href="#">
              <FaTiktok />
            </a>
            <a href="#">
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>Desarrollado con ❤️ por KB COLLECTION</span>
      </div>
    </footer>
  );
}
