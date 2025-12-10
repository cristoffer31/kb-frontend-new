import React, { useContext, useEffect, useRef, useState } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";
import { crearPedido } from "../services/pedidoService";
import { validarCuponApi } from "../services/CuponService"; 
import { listarZonas } from "../services/zonaService"; 
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { FaLocationArrow } from "react-icons/fa"; 

export default function Checkout() {
  const { items, total, limpiarCarrito } = useContext(CarritoContext);
  const { isLogged, usuario } = useContext(AuthContext); 
  const navigate = useNavigate();

  // DATOS DINÁMICOS
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  
  // Formulario
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [municipiosPosibles, setMunicipiosPosibles] = useState([]); 
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  // Fiscales
  const [tipoComprobante, setTipoComprobante] = useState("CONSUMIDOR_FINAL");
  const [nit, setNit] = useState("");
  const [nrc, setNrc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [giro, setGiro] = useState("");
  
  // Costos / GPS
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [coordenadas, setCoordenadas] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [obteniendoGps, setObteniendoGps] = useState(false);

  // Cupones
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState("");
  
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);
  const paypalRef = useRef(null);
  const buttonsInstance = useRef(null);
  const datosRef = useRef({}); 

  // Cálculos
  const descuentoDinero = cuponAplicado ? (total * (cuponAplicado.porcentaje / 100)) : 0;
  const totalFinalPagar = total - descuentoDinero + costoEnvio;

  // Actualizar Refs
  useEffect(() => {
    datosRef.current = { 
        departamento, ciudad, direccion, telefono, costoEnvio, coordenadas, items,
        tipoComprobante, nit, nrc, razonSocial, giro, cupon: cuponAplicado ? cuponAplicado.codigo : null 
    };
  }, [departamento, ciudad, direccion, telefono, costoEnvio, coordenadas, items, tipoComprobante, nit, nrc, razonSocial, giro, cuponAplicado]);

  // 1. CARGAR ZONAS
  useEffect(() => {
      listarZonas().then(data => setZonasDisponibles(data)).catch(console.error);
  }, []);

  // 2. DETECTAR CAMBIO DE DEPARTAMENTO
  useEffect(() => {
    const zona = zonasDisponibles.find(z => z.departamento === departamento);
    if (zona) {
        setCostoEnvio(zona.tarifa);
        if (zona.municipios.trim().toUpperCase() === "TODOS") {
            setMunicipiosPosibles(null);
            setCiudad("");
        } else {
            const lista = zona.municipios.split(",").map(m => m.trim());
            setMunicipiosPosibles(lista);
            if (!lista.includes(ciudad)) setCiudad("");
        }
    } else {
        setCostoEnvio(0);
        setMunicipiosPosibles([]);
        setCiudad("");
    }
  }, [departamento, zonasDisponibles]);

  // Validar sesión
  useEffect(() => {
    if (!isLogged) navigate("/login");
    else if (items.length === 0) navigate("/productos");
  }, [isLogged, items, navigate]);

  // GPS
  const obtenerUbicacion = () => {
    if (!navigator.geolocation) { setGpsError("Navegador no soporta GPS"); return; }
    setObteniendoGps(true); setGpsError("");
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const link = `http://googleusercontent.com/maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
            setCoordenadas(link); setObteniendoGps(false);
            if(!direccion) setDireccion("Ubicación GPS capturada");
        },
        (err) => { console.error(err); setGpsError("Activa tu ubicación."); setObteniendoGps(false); },
        { enableHighAccuracy: true }
    );
  };

  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setErrorCupon("");
    try {
        const data = await validarCuponApi(codigoCupon);
        setCuponAplicado(data);
        setCodigoCupon(""); 
        alert(`Cupón aplicado: ${data.porcentaje}% OFF`);
    } catch (error) {
        setCuponAplicado(null);
        setErrorCupon("Cupón no válido.");
    }
  };

  // PayPal
  useEffect(() => {
    if (!window.paypal || !paypalRef.current) return;
    if (buttonsInstance.current) { try { buttonsInstance.current.close(); } catch (e) {} paypalRef.current.innerHTML = ""; }

    const valorPaypal = totalFinalPagar.toFixed(2);

    const renderButtons = async () => {
        try {
            const buttons = window.paypal.Buttons({
                style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{ amount: { value: valorPaypal } }]
                    });
                },
                onClick: (data, actions) => {
                    const d = datosRef.current;
                    if (!d.departamento || !d.ciudad || !d.direccion || !d.telefono) {
                        setMensaje("Faltan datos de envío.");
                        return actions.reject();
                    }
                    if (d.tipoComprobante === "CREDITO_FISCAL" && (!d.nit || !d.nrc)) {
                         setMensaje("⚠ Faltan datos fiscales.");
                         return actions.reject();
                    }
                    setMensaje("");
                    return actions.resolve();
                },
                onApprove: async (data, actions) => {
                    setProcesando(true);
                    setMensaje("Procesando pago...");
                    try {
                        const order = await actions.order.capture();
                        await guardarPedido(order.id);
                    } catch (error) {
                        setMensaje("Pago rechazado.");
                        setProcesando(false);
                    }
                },
                onError: (err) => { setMensaje("Error técnico."); }
            });
            if (paypalRef.current) { await buttons.render(paypalRef.current); buttonsInstance.current = buttons; }
        } catch (e) { console.error(e); }
    };
    renderButtons();
    return () => {
        if (buttonsInstance.current) { try { buttonsInstance.current.close(); } catch (e) {} buttonsInstance.current = null; }
        if (paypalRef.current) paypalRef.current.innerHTML = "";
    };
  }, [totalFinalPagar]); 

  // --- GUARDAR PEDIDO Y ENVIAR WHATSAPP ---
  async function guardarPedido(paypalId) {
    const d = datosRef.current;
    try {
        const payload = {
            departamento: d.departamento,
            direccion: `${d.direccion}, ${d.ciudad}. Tel: ${d.telefono}`,
            coordenadas: d.coordenadas,
            costoEnvio: d.costoEnvio,
            paypalOrderId: paypalId,
            metodoPago: "PAYPAL",
            tipoComprobante: d.tipoComprobante,
            documentoFiscal: d.nit, nrc: d.nrc, razonSocial: d.razonSocial, giro: d.giro,
            cupon: d.cupon, 
            items: d.items.map(it => ({ productoId: it.producto.id, cantidad: it.cantidad }))
        };

        // 1. Guardar en BD
        const respuesta = await crearPedido(payload);
        const idPedido = respuesta.id || "N/A";

        // 2. Generar mensaje de WhatsApp
        const numeroVentas = "50370000000"; // <--- ¡PON TU NÚMERO AQUÍ!
        
        let mensajeWA = `*¡Hola! Nuevo pedido en KB Collection.*\n\n`;
        mensajeWA += `*Pedido #:* ${idPedido}\n`;
        mensajeWA += `*Cliente:* ${usuario?.nombre || "Cliente"}\n`;
        mensajeWA += `*Envío:* ${d.departamento}, ${d.ciudad}\n`;
        mensajeWA += `*Tel:* ${d.telefono}\n`;
        
        if (d.tipoComprobante === "CREDITO_FISCAL") {
             mensajeWA += `🏢 *Factura:* Crédito Fiscal (NRC: ${d.nrc})\n`;
        }

        mensajeWA += `\n *Productos:*\n`;
        d.items.forEach(it => {
            mensajeWA += `- ${it.cantidad}x ${it.producto.nombre}\n`;
        });

        mensajeWA += `\n*Total Pagado:* $${(total + costoEnvio).toFixed(2)} (PayPal)`;
        
        if(d.coordenadas) {
            mensajeWA += `\n\n*Ubicación GPS:* ${d.coordenadas}`;
        }

        const urlWhatsApp = `https://wa.me/${numeroVentas}?text=${encodeURIComponent(mensajeWA)}`;

        // 3. Redirigir
        setMensaje(" ¡Pedido completado! Abriendo WhatsApp...");
        limpiarCarrito();
        setTimeout(() => {
            window.open(urlWhatsApp, "_blank");
            navigate("/mis-pedidos");
        }, 2000);

    } catch (e) { setMensaje("⚠ Error al guardar."); setTimeout(() => navigate("/mis-pedidos"), 3000); } 
    finally { setProcesando(false); }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-box">
        <h2>Finalizar Compra</h2>

        <div className="checkout-section">
            <h3>📍 Zona de Cobertura</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                
                <select value={departamento} onChange={e => setDepartamento(e.target.value)} className="input-field">
                    <option value="">Selecciona Departamento</option>
                    {zonasDisponibles.map(z => (
                        <option key={z.id} value={z.departamento}>{z.departamento} (${z.tarifa.toFixed(2)})</option>
                    ))}
                </select>

                {municipiosPosibles === null ? (
                    <input type="text" placeholder="Escribe tu Municipio..." value={ciudad} onChange={e => setCiudad(e.target.value)} className="input-field" disabled={!departamento} required />
                ) : (
                    <select value={ciudad} onChange={e => setCiudad(e.target.value)} className="input-field" disabled={!departamento || municipiosPosibles.length === 0}>
                        <option value="">Selecciona Zona</option>
                        {municipiosPosibles.map((mun, i) => <option key={i} value={mun}>{mun}</option>)}
                    </select>
                )}
            </div>
            
            <textarea value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección exacta..." className="input-field textarea-field"/>
            <input type="tel" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} className="input-field"/>
            <button type="button" onClick={obtenerUbicacion} disabled={obteniendoGps || coordenadas} className={`btn-gps ${coordenadas ? 'gps-active' : ''}`}>
               {obteniendoGps ? "Buscando..." : coordenadas ? "Ubicación Guardada" : <><FaLocationArrow/> Usar GPS</>}
            </button>
            {gpsError && <small className="error-text">{gpsError}</small>}
        </div>

        {/* DATOS FISCALES */}
        <div className="checkout-section">
            <h3>📄 Datos de Facturación</h3>
            <div style={{display:'flex', gap:'20px', marginBottom:'10px'}}>
                <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                    <input type="radio" name="tipoComprobante" value="CONSUMIDOR_FINAL" checked={tipoComprobante === "CONSUMIDOR_FINAL"} onChange={e => setTipoComprobante(e.target.value)} /> Consumidor Final
                </label>
                <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                    <input type="radio" name="tipoComprobante" value="CREDITO_FISCAL" checked={tipoComprobante === "CREDITO_FISCAL"} onChange={e => setTipoComprobante(e.target.value)} /> Crédito Fiscal
                </label>
            </div>
            {tipoComprobante === "CREDITO_FISCAL" && (
                <div className="fiscal-grid" style={{display:'grid', gap:'10px'}}>
                    <input type="text" placeholder="Razón Social" className="input-field" value={razonSocial} onChange={e => setRazonSocial(e.target.value)} />
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                        <input type="text" placeholder="NIT" className="input-field" value={nit} onChange={e => setNit(e.target.value)} />
                        <input type="text" placeholder="NRC" className="input-field" value={nrc} onChange={e => setNrc(e.target.value)} />
                    </div>
                    <input type="text" placeholder="Giro" className="input-field" value={giro} onChange={e => setGiro(e.target.value)} />
                </div>
            )}
        </div>

        {/* CUPONES */}
        <div className="checkout-section">
            <h3> Cupón de Descuento</h3>
            <div style={{display:'flex', gap:'10px'}}>
                <input type="text" placeholder="Código" className="input-field" value={codigoCupon} onChange={e => setCodigoCupon(e.target.value.toUpperCase())} disabled={cuponAplicado} style={{margin:0}} />
                <button onClick={cuponAplicado ? () => setCuponAplicado(null) : handleAplicarCupon} style={{padding:'0 20px', borderRadius:'8px', border:'none', background: cuponAplicado ? '#ef4444' : '#004aad', color:'white', cursor:'pointer', fontWeight:'bold'}}>
                    {cuponAplicado ? "Quitar" : "Canjear"}
                </button>
            </div>
            {errorCupon && <small className="error-text">{errorCupon}</small>}
            {cuponAplicado && <small style={{color:'#16a34a', fontWeight:'bold', marginTop:'5px', display:'block'}}>✅ Cupón aplicado: {cuponAplicado.porcentaje}%</small>}
        </div>

        {/* RESUMEN */}
        <div className="checkout-section">
            <h3>Resumen</h3>
            <div className="resumen-row"><span>Subtotal:</span> <span>${total.toFixed(2)}</span></div>
            {cuponAplicado && <div className="resumen-row" style={{color:'#16a34a', fontWeight:'bold'}}><span>Descuento ({cuponAplicado.codigo}):</span> <span>- ${descuentoDinero.toFixed(2)}</span></div>}
            <div className="resumen-row"><span>Envío ({ciudad || "Zona"}):</span> <span>${costoEnvio.toFixed(2)}</span></div>
            <div className="checkout-total" style={{borderTop:'1px dashed #ccc', paddingTop:'10px', marginTop:'10px'}}>
                <span>Total a Pagar:</span> <span>${totalFinalPagar.toFixed(2)}</span>
            </div>
        </div>

        <div className="checkout-section">
            <h3>Pagar</h3>
            <div style={{ position: 'relative', minHeight: '150px' }}>
                {procesando && <div className="overlay-loading">Procesando...</div>}
                <div ref={paypalRef}></div>
            </div>
        </div>

        {mensaje && <div className={`checkout-msg ${mensaje.includes('✅') ? 'success' : 'error'}`}>{mensaje}</div>}
      </div>
    </div>
  );
}