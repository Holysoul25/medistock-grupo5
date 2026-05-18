const axios = require('axios');

const BASE_URL = process.env.SHIPIT_URL || 'https://api.shipit.cl/v/0';
const EMAIL = process.env.SHIPIT_EMAIL || '';
const TOKEN = process.env.SHIPIT_TOKEN || '';
const MOCK = process.env.SHIPIT_MOCK !== 'false';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.shipit.v4',
    'X-Shipit-Email': EMAIL,
    'X-Shipit-Access-Token': TOKEN,
  },
});

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

  const comuna = await buscarComuna(envio.ciudad);

  const reference = process.env.NODE_ENV === 'production'
    ? `MS-${envio.numero_pedido}`
    : `TEST-MS-${envio.numero_pedido}`;

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

  const response = await client.get(`/shipments/tracking/${codigo_seguimiento}`);
  const data = response.data;

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

let _comunasCache = null;

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
  if (MOCK) {
    return [
      { id: 1, name: 'Santiago' },
      { id: 2, name: 'Providencia' },
      { id: 3, name: 'Las Condes' },
      { id: 4, name: 'Ñuñoa' },
      { id: 5, name: 'Maipú' },
      { id: 6, name: 'La Florida' },
      { id: 7, name: 'Puente Alto' },
      { id: 8, name: 'San Bernardo' },
      { id: 9, name: 'Quilicura' },
      { id: 10, name: 'Recoleta' },
      { id: 11, name: 'Valparaíso' },
      { id: 12, name: 'Viña del Mar' },
      { id: 13, name: 'Concepción' },
      { id: 14, name: 'Temuco' },
      { id: 15, name: 'Antofagasta' }
    ];
  }
  if (!_comunasCache) {
    const res = await client.get('/communes');
    _comunasCache = res.data;
  }
  return _comunasCache;
};

module.exports = { generarOrdenEnvio, consultarTracking, getComunas };