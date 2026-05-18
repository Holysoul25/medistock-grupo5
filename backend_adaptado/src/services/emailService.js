const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL; // tu email verificado en SendGrid

const TEMPLATES = {
  pedido_creado: {
    subject: '✅ Tu pedido ha sido recibido - MediStock',
    html: (data) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A1A1A;">Pedido recibido</h2>
        <p>Hola <strong>${data.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${data.id_pedido}</strong> ha sido recibido y está siendo revisado.</p>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Total:</strong> ${data.total}</p>
          <p style="margin: 8px 0 0;"><strong>Estado:</strong> Pendiente</p>
        </div>
        <p>Te notificaremos cuando sea aprobado.</p>
        <p style="color: #9E9E9E; font-size: 12px;">MediStock</p>
      </div>
    `
  },
  pedido_aprobado: {
    subject: '🎉 Tu pedido fue aprobado - MediStock',
    html: (data) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A1A1A;">Pedido aprobado</h2>
        <p>Hola <strong>${data.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${data.id_pedido}</strong> ha sido <strong style="color: #3B82F6;">aprobado</strong>.</p>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Total:</strong> ${data.total}</p>
          <p style="margin: 8px 0 0;"><strong>Dirección:</strong> ${data.direccion ?? 'Por confirmar'}</p>
        </div>
        <p>Pronto será despachado.</p>
        <p style="color: #9E9E9E; font-size: 12px;">MediStock</p>
      </div>
    `
  },
  pedido_despachado: {
    subject: '🚚 Tu pedido está en camino - MediStock',
    html: (data) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A1A1A;">Pedido en camino</h2>
        <p>Hola <strong>${data.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${data.id_pedido}</strong> ha sido <strong style="color: #8B5CF6;">despachado</strong>.</p>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Código de seguimiento:</strong> ${data.codigo_seguimiento ?? 'No disponible'}</p>
          <p style="margin: 8px 0 0;"><strong>Dirección:</strong> ${data.direccion ?? 'Por confirmar'}</p>
        </div>
        <p style="color: #9E9E9E; font-size: 12px;">MediStock</p>
      </div>
    `
  },
  pedido_entregado: {
    subject: '📦 Tu pedido fue entregado - MediStock',
    html: (data) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A1A1A;">Pedido entregado</h2>
        <p>Hola <strong>${data.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${data.id_pedido}</strong> ha sido <strong style="color: #10B981;">entregado</strong> exitosamente.</p>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Total pagado:</strong> ${data.total}</p>
        </div>
        <p>Gracias por tu compra.</p>
        <p style="color: #9E9E9E; font-size: 12px;">MediStock</p>
      </div>
    `
  },
  pedido_cancelado: {
    subject: '❌ Tu pedido fue cancelado - MediStock',
    html: (data) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A1A1A;">Pedido cancelado</h2>
        <p>Hola <strong>${data.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${data.id_pedido}</strong> ha sido <strong style="color: #EF4444;">cancelado</strong>.</p>
        <p>Si tienes dudas contáctanos.</p>
        <p style="color: #9E9E9E; font-size: 12px;">MediStock</p>
      </div>
    `
  },
  stock_bajo: {
    subject: '⚠️ Alerta de stock bajo - MediStock',
    html: (data) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A1A1A;">Alerta de stock bajo</h2>
        <p>El siguiente producto tiene stock por debajo del mínimo:</p>
        <div style="background: #FFF3CD; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #F59E0B;">
          <p style="margin: 0;"><strong>Producto:</strong> ${data.nombre}</p>
          <p style="margin: 8px 0 0;"><strong>Código:</strong> ${data.codigo}</p>
          <p style="margin: 8px 0 0;"><strong>Stock actual:</strong> ${data.stock_actual} unidades</p>
          <p style="margin: 8px 0 0;"><strong>Stock mínimo:</strong> ${data.stock_minimo} unidades</p>
        </div>
        <p style="color: #9E9E9E; font-size: 12px;">MediStock - Sistema automático</p>
      </div>
    `
  }
};

const emailService = {
  async sendPedidoEmail(evento, data) {
    const template = TEMPLATES[evento];
    if (!template || !data.email) return;

    try {
      await sgMail.send({
        to: data.email,
        from: FROM_EMAIL,
        subject: template.subject,
        html: template.html(data)
      });
      console.log(`Email enviado [${evento}] a ${data.email}`);
    } catch (error) {
      console.error(`Error enviando email [${evento}]:`, error?.response?.body ?? error.message);
    }
  },

  async sendStockBajoEmail(adminEmail, data) {
    const template = TEMPLATES['stock_bajo'];
    try {
      await sgMail.send({
        to: adminEmail,
        from: FROM_EMAIL,
        subject: template.subject,
        html: template.html(data)
      });
      console.log(`Email stock bajo enviado a ${adminEmail}`);
    } catch (error) {
      console.error('Error enviando email stock bajo:', error?.response?.body ?? error.message);
    }
  }
};

module.exports = emailService;