const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', app: 'MEDISTOCK API', version: '1.0.0' });
});

// Rutas de la API
app.use('/api/v1', routes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Middleware de errores
app.use(errorHandler);

module.exports = app;
