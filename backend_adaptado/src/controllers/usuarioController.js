const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');        // ← asegúrate que esté
const { success } = require('../utils/response');   // ← y este también
const usuarioService = require('../services/usuarioService');



const register = async (req, res, next) => {
  try {
    const usuario = await usuarioService.register(req.body);
    success(res, usuario, 'Usuario registrado', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await usuarioService.login(req.body.email, req.body.password);
    success(res, result, 'Login exitoso');
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const usuario = await usuarioService.getProfile(req.user.id);
    success(res, usuario);
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll();
    success(res, usuarios);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };
    success(res, usuario);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const usuario = await Usuario.updateById(req.params.id, req.body);
    success(res, usuario, 'Usuario actualizado');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await Usuario.deleteById(req.params.id);
    success(res, null, 'Usuario eliminado');
  } catch (err) { next(err); }

};



module.exports = { register, login, getProfile, getAll, getById, update, remove };