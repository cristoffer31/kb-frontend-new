import React, { useContext, useState, useMemo } from "react"; // Añadimos useMemo para eficiencia
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Carrito.css";
import { CarritoContext } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaArrowRight, FaShoppingBag, FaMinus, FaPlus, FaTag, FaBoxOpen, FaTicketAlt, FaTimes } from "react-icons/fa";

export default function Carrito() {
  const { carrito, actualizarCantidad, eliminarProducto, vaciarCarrito, total, cantidadTotal, obtenerPrecioUnitario } = useContext(CarritoContext);
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [descuentoValor, setDescuentoValor] = useState(0); 
  const [cargandoCupon, setCargandoCupon] = useState(false);

  // --- LÓGICA DE CUPÓN ---
  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setCargandoCupon(true);
    try {
        const res = await api.get(`/cupones/validar/${codigoCupon.trim()}`);
        const data = res.data;

        // --- SOLUCIÓN AL NULL ---
        // Intentamos obtener el valor de cualquier propiedad posible que mande el backend
        const valorNumerico = Number(data.valor) || Number(data.porcentaje) || 0;
        const subtotalActual = Number(total) || 0;
        
        let ahorroCalculado = 0;

        if (data.tipo === 'PORCENTAJE') {
            ahorroCalculado = (subtotalActual * valorNumerico) / 100;
        } else {
            ahorroCalculado = valorNumerico;
        }

        // Si el ahorro es 0 o NaN, algo anda mal con el dato del backend
        if (!ahorroCalculado || isNaN(ahorroCalculado)) {
            console.error("El backend mandó un valor inválido:", data);
        }

        const ahorroFinal = Math.min(ahorroCalculado, subtotalActual);

        setDescuentoValor(ahorroFinal);
        setCuponAplicado({
            ...data,
            valorMostrado: valorNumerico // Guardamos el número limpio para el texto
        });
        
    } catch (error) {
        setDescuentoValor(0);
        setCuponAplicado(null);
    } finally {
        setCargandoCupon(false);
    }
};

  const quitarCupon = () => {
    setCuponAplicado(null);
    setDescuentoValor(0);
    setCodigoCupon("");
  };

  // --- CÁLCULOS SEGUROS PARA EL RENDER ---
  // Usamos useMemo para que el total se actualice SIEMPRE que cambie el total del carrito o el descuento
  const { subtotalSeguro, totalConDescuento } = useMemo(() => {
    const s = Number(total) || 0;
    const d = Number(descuentoValor) || 0;
    return {
        subtotalSeguro: s,
        totalConDescuento: Math.max(0, s - d)
    };
  }, [total, descuentoValor]);

  if (!carrito || carrito.length === 0) {
    return (
      <div className="carrito-vacio-container">
        <div className="icono-vacio"><FaShoppingBag /></div>
        <h2>Tu carrito está vacío</h2>
        <p>¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
        <Link to="/productos" className="btn-ir-tienda">Ir a la Tienda</Link>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <div className="carrito-header">
        <h1 className="carrito-titulo">Mi Carrito <span className="badge-cantidad">{cantidadTotal}</span></h1>
        <button className="btn-limpiar" onClick={vaciarCarrito}>Vaciar Carrito</button>
      </div>

      <div className="carrito-grid">
        <div className="carrito-items">
          {carrito.map((prod, index) => {
            const img = prod.imagenUrl || prod.imagen || "/placeholder.png";
            const nombre = prod.nombre || "Producto";
            const precioBase = parseFloat(prod.precio || 0);
            const precioFinal = obtenerPrecioUnitario(prod, prod.cantidad);
            const subtotalItem = precioFinal * prod.cantidad;

            return (
              <div key={prod.id || index} className="item-card">
                <div className="item-img-wrapper">
                  <img src={img} alt={nombre} />
                </div>
                <div className="item-content">
                  <div className="item-main-info">
                      <div className="info-header">
                          <h3>{nombre}</h3>
                      </div>
                      <div className="item-precios">
                        {precioFinal < precioBase && <span className="precio-tachado">${precioBase.toFixed(2)}</span>}
                        <span className="precio-actual">${precioFinal.toFixed(2)}</span>
                      </div>
                  </div>
                  <div className="item-actions">
                    <div className="qty-selector-modern">
                        <button onClick={() => actualizarCantidad(prod.id, prod.cantidad - 1)} disabled={prod.cantidad <= 1} className="qty-btn"><FaMinus/></button>
                        <span className="qty-value">{prod.cantidad}</span>
                        <button onClick={() => actualizarCantidad(prod.id, prod.cantidad + 1)} className="qty-btn"><FaPlus/></button>
                    </div>
                    <div className="item-subtotal-box">
                        <span className="label-subtotal">Subtotal:</span>
                        <span className="valor-subtotal">${subtotalItem.toFixed(2)}</span>
                    </div>
                    <button className="btn-trash-icon" onClick={() => eliminarProducto(prod.id)}>
                        <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="carrito-sidebar">
          <div className="resumen-card">
            <h2>Resumen del Pedido</h2>
            
            {/* SECCIÓN DE CUPÓN */}
            <div className="cupon-container">
                <div className="cupon-input-group">
                    <FaTicketAlt className="cupon-icon" />
                    <input 
                        type="text" 
                        placeholder="Código de descuento" 
                        value={codigoCupon}
                        onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                        disabled={!!cuponAplicado}
                    />
                    {!cuponAplicado ? (
                        <button onClick={aplicarCupon} disabled={cargandoCupon || !codigoCupon}>
                            {cargandoCupon ? "..." : "Aplicar"}
                        </button>
                    ) : (
                        <button className="btn-remove-cupon" onClick={quitarCupon}><FaTimes /></button>
                    )}
                </div>
                {cuponAplicado && (
    <p className="cupon-success-msg">
        ✅ Cupón <strong>{cuponAplicado.codigo}</strong> aplicado 
        ({cuponAplicado.porcentaje}% OFF)
    </p>
)}
            </div>

            <div className="resumen-detalles">
                <div className="resumen-fila">
                    <span>Subtotal</span>
                    <span>${subtotalSeguro.toFixed(2)}</span>
                </div>
                {descuentoValor > 0 && (
                    <div className="resumen-fila descuento-fila">
                        <span>Descuento</span>
                        <span className="ahorro-txt">- ${descuentoValor.toFixed(2)}</span>
                    </div>
                )}
                <div className="resumen-fila envio">
                    <span>Envío</span>
                    <span className="Validar">Calculado en el pago</span>
                </div>
            </div>

            <div className="divider"></div>
            <div className="resumen-total">
              <span>Total a Pagar</span>
              {/* AQUÍ SE MUESTRA EL TOTAL ACTUALIZADO */}
              <div className="total-precio">${totalConDescuento.toFixed(2)}</div>
            </div>
            
            <button 
                className="btn-checkout" 
                onClick={() => navigate(isLogged ? "/checkout" : "/login", { 
                    state: { 
                        cupon: cuponAplicado?.codigo,
                        descuento: descuentoValor 
                    } 
                })}
            >
              {isLogged ? "Proceder al Pago" : "Iniciar Sesión para Pagar"} <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}