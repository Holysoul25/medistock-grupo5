const axios = require('axios');

/**
 * Cliente de integración Bluexpress
 *
 * MODO ACTUAL: Mock realista con estructura real de la API Bluexpress.
 * Cuando tengan credenciales reales, solo cambiar:
 *   1. BLUEXPRESS_MOCK=false en .env
 *   2. Agregar BLUEXPRESS_API_KEY y BLUEXPRESS_CUENTA en .env
 *
 * Contacto para credenciales de prueba: integraciones@bluexpress.cl
 */

const BASE_URL = process.env.BLUEXPRESS_URL || 'https://api.bluexpress.cl/v1';
const API_KEY  = process.env.BLUEXPRESS_API_KEY || '';
const CUENTA   = process.env.BLUEXPRESS_CUENTA || '';
const MOCK     = process.env.BLUEXPRESS_MOCK !== 'false'; // true por defecto

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

/**
 * Genera una orden de envío en Bluexpress
 * @param {object} envio
 * @param {string} envio.numero_pedido
 * @param {string} envio.nombre_destinatario
 * @param {string} envio.direccion
 * @param {string} envio.ciudad
 * @param {string} envio.telefono
 * @param {number} envio.peso_kg
 * @param {string} envio.descripcion
 */
const generarOrdenEnvio = async (envio) => {
  if (MOCK) {
    // Mock con estructura real de respuesta Bluexpress
    console.log('⚠️  Bluexpress en modo MOCK. Activar con BLUEXPRESS_MOCK=false en .env');
    const codigo_seguimiento = `BX-${Date.now()}`;
    return {
      success: true,
      codigo_seguimiento,
      numero_orden: `ORD-${Math.floor(Math.random() * 999999)}`,
      estado: 'GENERADO',
      fecha_estimada_entrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      etiqueta_url: `https://mock.bluexpress.cl/etiqueta/${codigo_seguimiento}.pdf`,
      mensaje: 'Orden generada (modo mock)',
    };
  }

  // Integración real Bluexpress
  const payload = {
    cuenta: CUENTA,
    numero_referencia: envio.numero_pedido,
    destinatario: {
      nombre: envio.nombre_destinatario,
      direccion: envio.direccion,
      ciudad: envio.ciudad,
      telefono: envio.telefono,
    },
    paquete: {
      peso: envio.peso_kg || 1,
      descripcion: envio.descripcion || 'Productos médicos MEDISTOCK',
    },
    tipo_servicio: 'EXPRESS',
  };

  const response = await client.post('/envios', payload);
  return {
    success: true,
    codigo_seguimiento: response.data.codigo_seguimiento,
    numero_orden: response.data.numero_orden,
    estado: response.data.estado,
    fecha_estimada_entrega: response.data.fecha_estimada_entrega,
    etiqueta_url: response.data.etiqueta_url,
    raw: response.data,
  };
};

/**
 * Consulta el estado de un envío por código de seguimiento
 * @param {string} codigo_seguimiento - Código BX-xxxxxxxx
 */
const consultarTracking = async (codigo_seguimiento) => {
  if (MOCK) {
    const estados = [
      { estado: 'EN_BODEGA', descripcion: 'Paquete recibido en bodega de origen', ciudad: 'Santiago' },
      { estado: 'EN_TRANSITO', descripcion: 'En camino al destino', ciudad: 'Ruta Santiago-Valparaíso' },
      { estado: 'EN_REPARTO', descripcion: 'En reparto con mensajero', ciudad: 'Valparaíso' },
      { estado: 'ENTREGADO', descripcion: 'Entregado al destinatario', ciudad: 'Valparaíso' },
    ];
    const estadoActual = estados[Math.floor(Math.random() * estados.length)];
    return {
      codigo_seguimiento,
      ...estadoActual,
      ultima_actualizacion: new Date().toISOString(),
      historial: estados.slice(0, estados.indexOf(estadoActual) + 1),
    };
  }

  // Integración real
  const response = await client.get(`/tracking/${codigo_seguimiento}`);
  return {
    codigo_seguimiento,
    estado: response.data.estado,
    descripcion: response.data.descripcion,
    ciudad: response.data.ciudad,
    ultima_actualizacion: response.data.ultima_actualizacion,
    historial: response.data.historial || [],
    raw: response.data,
  };
};

module.exports = { generarOrdenEnvio, consultarTracking };
