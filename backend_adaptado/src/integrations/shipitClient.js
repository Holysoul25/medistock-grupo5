const axios = require('axios');

/**
 * Cliente de integración Shipit.cl
 *
 * MODO ACTUAL: Mock realista con estructura real de la API Shipit.
 * Cuando necesiten probarlo de verdad, solo cambiar:
 *   1. SHIPIT_MOCK=false en .env
 *   2. Agregar SHIPIT_EMAIL y SHIPIT_TOKEN en .env
 *
 * Registro gratuito:    https://www.shipit.cl/registro
 * Documentación API:   https://developers.shipit.cl/docs
 * Modo test:           El prefix "TEST-" en el reference genera pedidos de prueba
 *                      sin costo ni despacho real.
 * Soporte:             integraciones@shipit.cl
 */

const BASE_URL = process.env.SHIPIT_URL || 'https://api.shipit.cl/v/0';
const EMAIL = process.env.SHIPIT_EMAIL || '';
const TOKEN = process.env.SHIPIT_TOKEN || '';
const MOCK = process.env.SHIPIT_MOCK !== 'false'; // true por defecto

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.shipit.v4',
    // Shipit usa autenticación por email + token en cada request
    'X-Shipit-Email': EMAIL,
    'X-Shipit-Access-Token': TOKEN,
  },
});

/**
 * Genera una orden de envío en Shipit.cl
 * @param {object} envio
 * @param {string} envio.numero_pedido
 * @param {string} envio.nombre_destinatario
 * @param {string} envio.direccion
 * @param {string} envio.ciudad            - Nombre de comuna chilena (ej: "Las Condes")
 * @param {string} envio.telefono
 * @param {number} envio.peso_kg
 * @param {string} envio.descripcion
 */
const generarOrdenEnvio = async (envio) => {
  if (MOCK) {
    console.log('⚠️  Shipit en modo MOCK. Activar con SHIPIT_MOCK=false en .env');
    const codigo_seguimiento = `ST-${Date.now()}`;
    return {
      success: true,
      codigo_seguimiento,
      numero_orden: `TEST-${Math.floor(Math.random() * 999999)}`,
      estado: 'GENERADO',
      fecha_estimada_entrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      etiqueta_url: `https://mock.shipit.cl/etiqueta/${codigo_seguimiento}.pdf`,
      mensaje: 'Orden generada (modo mock)',
    };
  }

  // --- Integración real Shipit ---
  //
  // Shipit necesita el id de comuna (commune_id) en lugar del nombre de ciudad.
  // Para simplificar, lo buscamos dinámicamente por nombre.
  // En producción conviene cachear el listado de comunas al iniciar la app.
  const comuna = await buscarComuna(envio.ciudad);

    const reference = process.env.NODE_ENV === 'production'
  ? `MS-${envio.numero_pedido}`        // "MS-3" = 4 chars
  : `TEST-MS-${envio.numero_pedido}`;  // "TEST-MS-3" = 9 chars ✅

  const payload = {
    shipment: {
      kind: 0,
      platform: 2,
      reference,
      items: 1,
      sizes: {
        width: envio.ancho_cm || 20,
        height: envio.alto_cm || 15,
        length: envio.largo_cm || 30,
        weight: envio.peso_kg || 1,
      },
      courier: {
        client: process.env.SHIPIT_COURIER || 'chilexpress',
      },
      destiny: {
        street: envio.direccion,
        number: '0',
        complement: '',
        commune_id: comuna.id,
        commune_name: comuna.name,
        full_name: envio.nombre_destinatario,
        email: envio.email || '',
        phone: envio.telefono || '0000000000',
        kind: 'home_delivery',
      },
      insurance: {
        ticket_amount: 0.0,
        ticket_number: '',
        price: 0.0,
        detail: null,
        extra: false,
      },
    },
  };

  let response;
  try {
    response = await client.post('/shipments', payload);
  } catch (err) {
    console.error('❌ Payload enviado:', JSON.stringify(payload, null, 2));
    console.error('❌ Respuesta Shipit:', JSON.stringify(err.response?.data, null, 2));
    throw err;
  }


  const data = response.data;

  return {
    success: true,
    codigo_seguimiento: data.tracking_number || data.shipment?.tracking_number || data.id,
    numero_orden: String(data.id || data.shipment?.id || ''),
    estado: 'GENERADO',
    fecha_estimada_entrega: data.estimated_delivery || null,
    etiqueta_url: data.label_url || data.shipment?.label_url || null,
    raw: data,
  };
};

/**
 * Consulta el estado de un envío por código de seguimiento
 * Interfaz idéntica a la anterior — el controller no cambia.
 *
 * @param {string} codigo_seguimiento
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

  // --- Integración real Shipit ---
  const response = await client.get(`/shipments/tracking/${codigo_seguimiento}`);
  const data = response.data;

  // Mapear estados Shipit → estados internos (misma interfaz que antes)
  const mapaEstados = {
    'ready_to_ship': 'EN_BODEGA',
    'shipped': 'EN_TRANSITO',
    'in_transit': 'EN_TRANSITO',
    'out_for_delivery': 'EN_REPARTO',
    'delivered': 'ENTREGADO',
    'failed_attempt': 'EN_REPARTO',
    'exception': 'EXCEPCION',
    'returned': 'DEVUELTO',
  };

  const estadoRaw = data.status || data.shipment_status;
  const estadoInterno = mapaEstados[estadoRaw] || estadoRaw;

  return {
    codigo_seguimiento,
    estado: estadoInterno,
    descripcion: data.status_description || estadoRaw,
    ciudad: data.current_location || '',
    ultima_actualizacion: data.updated_at || new Date().toISOString(),
    historial: (data.tracking_history || []).map((e) => ({
      estado: mapaEstados[e.status] || e.status,
      descripcion: e.description,
      ciudad: e.location || '',
      fecha: e.timestamp,
    })),
    raw: data,
  };
};

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Busca el commune_id de Shipit por nombre de ciudad/comuna.
 * Shipit requiere IDs numéricos, no strings.
 * Cache simple en memoria para no llamar la API en cada pedido.
 */
let _comunasCache = null;

// ─── buscarComuna — match case-insensitive ───
// Cambia la función para retornar objeto en vez de solo id
const buscarComuna = async (nombreCiudad) => {
  if (!_comunasCache) {
    const res = await client.get('/communes');
    _comunasCache = res.data;
  }

  const nombre = nombreCiudad?.toUpperCase().trim();
  let comuna = _comunasCache.find(c => c.name?.toUpperCase().trim() === nombre);
  if (!comuna) comuna = _comunasCache.find(c => c.name?.toUpperCase().includes(nombre));
  if (!comuna) comuna = _comunasCache.find(c => c.name === 'SANTIAGO CENTRO');

  console.log(`✅ Comuna encontrada: ${comuna.name} (id: ${comuna.id})`);
  return { id: comuna.id, name: comuna.name };
};

const getComunas = async () => {
  if (!_comunasCache) {
    const res = await client.get('/communes');
    _comunasCache = res.data;
  }
  return _comunasCache;
};

module.exports = { generarOrdenEnvio, consultarTracking, getComunas };