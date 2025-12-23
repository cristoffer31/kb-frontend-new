import React, { useContext, useEffect, useRef, useState } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";
import { crearPedido } from "../services/pedidoService";
import { validarCuponApi } from "../services/CuponService"; 
import { listarZonas } from "../services/zonaService"; 
import api from "../services/api"; // <--- IMPORTANTE: Importamos api para pedir el link
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
    const [costoEnvioBase, setCostoEnvioBase] = useState(0); 
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
    // CÁLCULOS
    // ==========================================
    const subtotalSeguro = Number(total) || 0;
    const esEnvioGratis = cuponAplicado && cuponAplicado.es_envio_gratis;
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

    // Efectos de carga (Cupones, Zonas)
    useEffect(() => {
        if (location.state?.cupon) {
            setCodigoCupon(location.state.cupon);
            validarCuponApi(location.state.cupon).then(data => aplicarLogicaCupon(data)).catch(console.error);
        }
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

    const aplicarLogicaCupon = (data) => {
        if (data.es_envio_gratis) setDescuentoDinero(0);
        else {
            const valorCupon = Number(data.valor) || Number(data.porcentaje) || 0;
            const ahorro = data.tipo === 'PORCENTAJE' ? (subtotalSeguro * valorCupon) / 100 : valorCupon;
            setDescuentoDinero(ahorro);
        }
        setCuponAplicado(data);
    };

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

    // Actualizar Refs
    useEffect(() => {
        datosRef.current = { 
            departamento, ciudad, direccion, telefono, 
            costoEnvio: envioSeguro, 
            coordenadas, 
            items: carrito, 
            tipoComprobante, nit, nrc, razonSocial, giro, 
            cupon: cuponAplicado ? cuponAplicado.codigo : null 
        };
    }, [departamento, ciudad, direccion, telefono, envioSeguro, coordenadas, carrito, tipoComprobante, nit, nrc, razonSocial, giro, cuponAplicado]);

    // ==========================================
    // LÓGICA DE PAGO CON WOMPI (CORREGIDA)
    // ==========================================
    const manejarPagoWompi = async () => {
        const d = datosRef.current;
        
        // 1. Validaciones
        if (!d.departamento || !d.direccion || !d.telefono) {
            setMensaje("⚠ Por favor completa Departamento, Dirección y Teléfono.");
            return;
        }

        setProcesando(true);
        setMensaje("⏳ Registrando pedido y conectando con Wompi...");

        try {
            // 2. CREAR PEDIDO EN LARAVEL PRIMERO (Estado: Pendiente)
            // Esto asegura que la compra exista en tu BD antes de ir a pagar
            const payload = {
                ...d,
                metodoPago: "WOMPI", // Marcamos que es Wompi
                estado: "Pendiente de Pago", // Estado inicial seguro
                descuento: descuentoSeguro,
                total: totalFinalPagar,
                items: d.items.map(it => ({
                    productoId: it.id, 
                    cantidad: it.cantidad,
                    precio: obtenerPrecioUnitario(it, it.cantidad) 
                }))
            };

            await crearPedido(payload); // <--- ¡AQUÍ SE GUARDA!
        
// Nota: Dependiendo de tu servicio, el ID puede venir en respuestaPedido.data.id o respuestaPedido.id
           const pedidoIdCreado = respuestaPedido.data?.id || respuestaPedido.id;
           
            const { data } = await api.post('/wompi/link', { 
                monto: totalFinalPagar,
                pedido_id: pedidoIdCreado   
            });

            if (data.url_pago) {
                // 4. LIMPIAR CARRITO Y REDIRIGIR
                vaciarCarrito(); 
                window.location.href = data.url_pago; // Nos vamos a Wompi
            } else {
                throw new Error("No se recibió URL de pago");
            }

        } catch (e) { 
            console.error(e);
            setMensaje("⚠ Hubo un error al procesar. Si el pedido se guardó, búscalo en 'Mis Pedidos'."); 
            setProcesando(false);
        }
    };

    return (
        <div className="checkout-page">
            <h1 className="checkout-main-title">Finalizar Compra</h1>
            <div className="checkout-layout">
                {/* FORMULARIO DE ENVÍO */}
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

                {/* RESUMEN Y PAGO */}
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
                            {descuentoSeguro > 0 && <div className="summary-row discount"><span>Descuento</span> <span>- ${descuentoSeguro.toFixed(2)}</span></div>}
                            <div className="summary-row">
                                <span><FaTruck/> Envío</span> 
                                <span>{esEnvioGratis ? <span className="free-tag">GRATIS</span> : `$${envioSeguro.toFixed(2)}`}</span>
                            </div>
                            <div className="divider"></div>
                            <div className="summary-total"><span>Total</span> <span>${totalFinalPagar}</span></div>
                        </div>

                        <div className="payment-section">
                            <button 
                                className="btn-pago-bac" 
                                onClick={manejarPagoWompi} // <--- NUEVA FUNCIÓN
                                disabled={procesando}
                            >
                                <FaCreditCard style={{marginRight: '10px'}} />
                                {procesando ? "Conectando..." : `Pagar con Tarjeta $${totalFinalPagar}`}
                            </button>
                            <div className="secure-badge"><FaShieldAlt /> Pagos seguros por Wompi El Salvador</div>
                        </div>

                        {mensaje && <div className={`checkout-msg ${mensaje.includes('⚠') ? 'error' : 'info'}`}>{mensaje}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}