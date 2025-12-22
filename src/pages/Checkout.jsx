import React, { useContext, useEffect, useRef, useState } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";
import { crearPedido } from "../services/pedidoService";
import { validarCuponApi } from "../services/CuponService"; 
import { listarZonas } from "../services/zonaService"; 
import { useNavigate, useLocation } from "react-router-dom";
import "./Checkout.css";
import { FaLocationArrow, FaMapMarkerAlt, FaFileInvoiceDollar, FaTicketAlt, FaShieldAlt, FaTruck, FaCreditCard } from "react-icons/fa"; 

export default function Checkout() {
    const { carrito, total, vaciarCarrito, obtenerPrecioUnitario } = useContext(CarritoContext);
    const { isLogged } = useContext(AuthContext); 
    const navigate = useNavigate();
    const location = useLocation();

    // ESTADOS FORMULARIO
    const [zonasDisponibles, setZonasDisponibles] = useState([]);
    const [departamento, setDepartamento] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [municipiosPosibles, setMunicipiosPosibles] = useState([]); 
    const [direccion, setDireccion] = useState("");
    const [telefono, setTelefono] = useState("");

    // FISCALES
    const [tipoComprobante, setTipoComprobante] = useState("CONSUMIDOR_FINAL");
    const [nit, setNit] = useState("");
    const [nrc, setNrc] = useState("");
    const [razonSocial, setRazonSocial] = useState("");
    const [giro, setGiro] = useState("");
    
    // COSTOS / GPS
    const [costoEnvioBase, setCostoEnvioBase] = useState(0); // Renombrado a Base para claridad
    const [coordenadas, setCoordenadas] = useState(null);
    const [gpsError, setGpsError] = useState("");
    const [obteniendoGps, setObteniendoGps] = useState(false);

    // CUPONES
    const [codigoCupon, setCodigoCupon] = useState("");
    const [cuponAplicado, setCuponAplicado] = useState(null);
    const [descuentoDinero, setDescuentoDinero] = useState(0); 
    const [errorCupon, setErrorCupon] = useState("");
    
    const [mensaje, setMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);
    const datosRef = useRef({}); 

    // ==========================================
    // CÁLCULOS MATEMÁTICOS SEGUROS
    // ==========================================
    const subtotalSeguro = Number(total) || 0;

    // 1. LÓGICA DE ENVÍO GRATIS
    const esEnvioGratis = cuponAplicado && cuponAplicado.es_envio_gratis;
    
    // Si hay cupón de envío gratis, el costo es 0, si no, es el de la zona
    const envioSeguro = esEnvioGratis ? 0 : (Number(costoEnvioBase) || 0);
    
    const descuentoSeguro = Number(descuentoDinero) || 0;
    const totalFinalPagar = Math.max(0, subtotalSeguro + envioSeguro - descuentoSeguro).toFixed(2);

    // GPS
    const obtenerUbicacion = () => {
        if (!navigator.geolocation) { setGpsError("No soportado"); return; }
        setObteniendoGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const link = `https://googleusercontent.com/maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
                setCoordenadas(link); 
                setObteniendoGps(false);
                if(!direccion) setDireccion("Ubicación GPS capturada");
            },
            () => { setObteniendoGps(false); setGpsError("Activa el GPS"); },
            { enableHighAccuracy: true }
        );
    };

    // Cargar cupón desde el Carrito (si venía pre-cargado)
    useEffect(() => {
        if (location.state?.cupon) {
            setCodigoCupon(location.state.cupon);
            // Re-validamos para asegurar que traemos la bandera de envío gratis
            validarCuponApi(location.state.cupon).then(data => {
                aplicarLogicaCupon(data);
            }).catch(console.error);
        }
    }, [location.state]);

    // Función auxiliar para aplicar la lógica
    const aplicarLogicaCupon = (data) => {
        if (data.es_envio_gratis) {
            setDescuentoDinero(0); // El descuento es el envío, no el producto
        } else {
            const valorCupon = Number(data.valor) || Number(data.porcentaje) || 0;
            const ahorro = data.tipo === 'PORCENTAJE' ? (subtotalSeguro * valorCupon) / 100 : valorCupon;
            setDescuentoDinero(ahorro);
        }
        setCuponAplicado(data);
    };

    // Actualizar referencia de datos para el pago
    useEffect(() => {
        datosRef.current = { 
            departamento, ciudad, direccion, telefono, 
            costoEnvio: envioSeguro, // Aquí ya va 0 si es gratis
            coordenadas, 
            items: carrito, 
            tipoComprobante, nit, nrc, razonSocial, giro, 
            cupon: cuponAplicado ? cuponAplicado.codigo : null 
        };
    }, [departamento, ciudad, direccion, telefono, envioSeguro, coordenadas, carrito, tipoComprobante, nit, nrc, razonSocial, giro, cuponAplicado]);

    // Zonas
    useEffect(() => {
        listarZonas().then(data => setZonasDisponibles(Array.isArray(data) ? data : [])).catch(console.error);
    }, []);

    useEffect(() => {
        const zona = zonasDisponibles.find(z => z.departamento === departamento);
        if (zona) {
            setCostoEnvioBase(Number(zona.tarifa) || 0); 
            const lista = zona.municipios?.toUpperCase() === "TODOS" ? null : zona.municipios?.split(",").map(m => m.trim());
            setMunicipiosPosibles(lista);
        } else {
            setCostoEnvioBase(0);
            setMunicipiosPosibles([]);
        }
    }, [departamento, zonasDisponibles]);

    const handleAplicarCupon = async () => {
        if (!codigoCupon.trim()) return;
        setErrorCupon("");
        try {
            const data = await validarCuponApi(codigoCupon);
            aplicarLogicaCupon(data);
        } catch (error) {
            setErrorCupon("Cupón no válido.");
            setCuponAplicado(null);
            setDescuentoDinero(0);
        }
    };

    // ==========================================
    // PROCESAR PAGO
    // ==========================================
    const manejarPagoBAC = async () => {
        const d = datosRef.current;
        
        if (!d.departamento || !d.direccion || !d.telefono) {
            setMensaje("⚠ Por favor completa los datos de envío.");
            return;
        }

        setProcesando(true);
        setMensaje("");

        try {
            const payload = {
                ...d,
                metodoPago: "LINK_BAC",
                estado: "Pendiente de Pago",
                descuento: descuentoSeguro,
                total: totalFinalPagar,
                items: d.items.map(it => ({
                    productoId: it.id, 
                    cantidad: it.cantidad,
                    precio: obtenerPrecioUnitario(it, it.cantidad) 
                }))
            };

            await crearPedido(payload);
            vaciarCarrito(); 

            // Link de BAC
            const linkBAC = "https://pagos.baccredomatic.com/TU_LINK_AQUI"; 
            window.location.href = linkBAC;

        } catch (e) { 
            setMensaje("⚠ Error al registrar pedido. Intenta nuevamente."); 
            setProcesando(false);
        }
    };

    return (
        <div className="checkout-page">
            <h1 className="checkout-main-title">Finalizar Compra</h1>
            <div className="checkout-layout">
                <div className="checkout-form-col">
                    <div className="checkout-card">
                        <div className="card-header"><FaMapMarkerAlt className="card-icon" /> <h3>Dirección de Envío</h3></div>
                        <div className="card-body">
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Departamento</label>
                                    <select value={departamento} onChange={e => setDepartamento(e.target.value)} className="input-field">
                                        <option value="">Seleccionar...</option>
                                        {zonasDisponibles.map(z => <option key={z.id} value={z.departamento}>{z.departamento} (${Number(z.tarifa).toFixed(2)})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Municipio</label>
                                    {municipiosPosibles === null ? (
                                        <input type="text" placeholder="Municipio" value={ciudad} onChange={e => setCiudad(e.target.value)} className="input-field" disabled={!departamento} />
                                    ) : (
                                        <select value={ciudad} onChange={e => setCiudad(e.target.value)} className="input-field" disabled={!departamento}>
                                            <option value="">Seleccionar...</option>
                                            {municipiosPosibles.map((m, i) => <option key={i} value={m}>{m}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <textarea value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Pasaje, casa, punto de referencia..." className="input-field textarea-field"/>
                            <div className="form-grid-2">
                                <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" className="input-field"/>
                                <button type="button" onClick={obtenerUbicacion} disabled={obteniendoGps} className={`btn-gps ${coordenadas ? 'gps-active' : ''}`}>
                                    {obteniendoGps ? "Buscando..." : coordenadas ? "📍 GPS OK" : <><FaLocationArrow/> GPS</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="checkout-card">
                        <div className="card-header"><FaFileInvoiceDollar className="card-icon" /> <h3>Facturación</h3></div>
                        <div className="card-body">
                            <div className="radio-group">
                                <label className={`radio-label ${tipoComprobante === "CONSUMIDOR_FINAL" ? 'selected' : ''}`}><input type="radio" value="CONSUMIDOR_FINAL" checked={tipoComprobante === "CONSUMIDOR_FINAL"} onChange={e => setTipoComprobante(e.target.value)} /> Final</label>
                                <label className={`radio-label ${tipoComprobante === "CREDITO_FISCAL" ? 'selected' : ''}`}><input type="radio" value="CREDITO_FISCAL" checked={tipoComprobante === "CREDITO_FISCAL"} onChange={e => setTipoComprobante(e.target.value)} /> Fiscal</label>
                            </div>
                            {tipoComprobante === "CREDITO_FISCAL" && (
                                <div className="fiscal-form">
                                    <input type="text" placeholder="Razón Social" className="input-field" value={razonSocial} onChange={e => setRazonSocial(e.target.value)} />
                                    <div className="form-grid-2">
                                        <input type="text" placeholder="NIT" className="input-field" value={nit} onChange={e => setNit(e.target.value)} />
                                        <input type="text" placeholder="NRC" className="input-field" value={nrc} onChange={e => setNrc(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="checkout-summary-col">
                    <div className="checkout-card summary-card">
                        <h3>Resumen del Pedido</h3>
                        <div className="cupon-section">
                            <div className="cupon-input-group">
                                <FaTicketAlt className="cupon-icon"/><input type="text" placeholder="Código" value={codigoCupon} onChange={e => setCodigoCupon(e.target.value.toUpperCase())} disabled={!!cuponAplicado} />
                                <button onClick={cuponAplicado ? () => {setCuponAplicado(null); setDescuentoDinero(0);} : handleAplicarCupon} className={cuponAplicado ? 'btn-remove' : 'btn-apply'}>{cuponAplicado ? "X" : "Aplicar"}</button>
                            </div>
                            {errorCupon && <small className="error-text">{errorCupon}</small>}
                        </div>
                        <div className="summary-details">
                            <div className="summary-row"><span>Subtotal</span> <span>${subtotalSeguro.toFixed(2)}</span></div>
                            
                            {/* Descuento Monetario */}
                            {descuentoSeguro > 0 && <div className="summary-row discount"><span>Descuento</span> <span>- ${descuentoSeguro.toFixed(2)}</span></div>}
                            
                            {/* Envío con lógica visual de Gratis */}
                            <div className="summary-row">
                                <span><FaTruck/> Envío</span> 
                                <span>
                                    {esEnvioGratis ? (
                                        <span style={{color:'#4ade80', fontWeight:'bold', background:'#064e3b', padding:'2px 6px', borderRadius:'4px', fontSize:'0.9rem'}}>GRATIS (Cupón)</span>
                                    ) : (
                                        `$${envioSeguro.toFixed(2)}`
                                    )}
                                </span>
                            </div>
                            
                            <div className="divider"></div>
                            <div className="summary-total"><span>Total</span> <span>${totalFinalPagar}</span></div>
                        </div>

                        <div className="payment-section">
                            <button 
                                className="btn-pago-bac" 
                                onClick={manejarPagoBAC} 
                                disabled={procesando}
                            >
                                <FaCreditCard style={{marginRight: '10px'}} />
                                {procesando ? "Procesando..." : `Pagar con Tarjeta $${totalFinalPagar}`}
                            </button>
                            <div className="secure-badge"><FaShieldAlt /> Transacción segura via BAC</div>
                        </div>

                        {mensaje && <div className={`checkout-msg ${mensaje.includes('✅') ? 'success' : 'error'}`}>{mensaje}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}