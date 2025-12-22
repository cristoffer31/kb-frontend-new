import React, { useContext, useState, useMemo } from "react"; 
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Carrito.css";
import { CarritoContext } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaArrowRight, FaShoppingBag, FaMinus, FaPlus, FaTag, FaTicketAlt, FaTimes, FaTruck } from "react-icons/fa";

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

        // 1. SI ES ENVÍO GRATIS
        if (data.es_envio_gratis) {
            setDescuentoValor(0); // El descuento en productos es 0
            setCuponAplicado({
                ...data,
                esEnvioGratis: true // Aseguramos la bandera
            });
        } 
        // 2. SI ES DESCUENTO NORMAL
        else {
            const valorNumerico = Number(data.valor) || Number(data.porcentaje) || 0;
            const subtotalActual = Number(total) || 0;
            let ahorroCalculado = data.tipo === 'PORCENTAJE' 
                ? (subtotalActual * valorNumerico) / 100 
                : valorNumerico;

            setDescuentoValor(Math.min(ahorroCalculado, subtotalActual));
            setCuponAplicado({
                ...data,
                esEnvioGratis: false,
                valorMostrado: valorNumerico
            });
        }
        
    } catch (error) {
        setDescuentoValor(0);
        setCuponAplicado(null);
        alert("Cupón no válido o expirado");
    } finally {
        setCargandoCupon(false);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setDescuentoValor(0);
    setCodigoCupon("");
  };

  // --- CÁLCULOS SEGUROS ---
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
            const precioFinal = obtenerPrecioUnitario(prod, prod.cantidad);
            const subtotalItem = precioFinal * prod.cantidad;

            return (
              <div key={prod.id || index} className="item-card">
                <div className="item-img-wrapper"><img src={img} alt={prod.nombre} /></div>
                <div className="item-content">
                  <div className="item-main-info">
                      <h3>{prod.nombre}</h3>
                      <span className="precio-actual">${precioFinal.toFixed(2)}</span>
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
                    <button className="btn-trash-icon" onClick={() => eliminarProducto(prod.id)}><FaTrash /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="carrito-sidebar">
          <div className="resumen-card">
            <h2>Resumen del Pedido</h2>
            
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
                
                {/* MENSAJE DE ÉXITO DINÁMICO */}
                {cuponAplicado && (
                    <p className="cupon-success-msg">
                        {cuponAplicado.esEnvioGratis ? (
                            <span style={{color: '#059669', display:'flex', alignItems:'center', gap:'5px'}}>
                                <FaTruck/> ¡Envío Gratis Activado!
                            </span>
                        ) : (
                            <span>✅ Cupón <strong>{cuponAplicado.codigo}</strong> aplicado</span>
                        )}
                    </p>
                )}
            </div>

            <div className="resumen-detalles">
                <div className="resumen-fila">
                    <span>Subtotal</span>
                    <span>${subtotalSeguro.toFixed(2)}</span>
                </div>
                
                {/* MOSTRAR DESCUENTO SI EXISTE */}
                {descuentoValor > 0 && (
                    <div className="resumen-fila descuento-fila">
                        <span>Descuento</span>
                        <span className="ahorro-txt">- ${descuentoValor.toFixed(2)}</span>
                    </div>
                )}

                {/* FILA DE ENVÍO INTELIGENTE */}
                <div className="resumen-fila envio">
                    <span>Envío</span>
                    {cuponAplicado?.esEnvioGratis ? (
                        <span style={{color:'#059669', fontWeight:'bold'}}>GRATIS (Al pagar)</span>
                    ) : (
                        <span className="Validar">Calculado en el pago</span>
                    )}
                </div>
            </div>

            <div className="divider"></div>
            <div className="resumen-total">
              <span>Total Estimado</span>
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
              {isLogged ? "Proceder al Pago" : "Iniciar Sesión"} <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}