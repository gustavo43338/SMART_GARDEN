require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

let estadoBomba = "off";

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Esquema de usuarios
const userSchema = new mongoose.Schema({
  nombre_completo: { type: String, required: true },  // <-- Aquí
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  Plantas: { type: [String], default: [] },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'Usuarios');

// Esquema de plantas
const plantaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  temperaturaideal: Number,
  humedadideal: Number,
  aireideal: Number,
  aguaideal: Number,
  tierraideal: Number,
  luminocidadideal: Number
});

const Planta = mongoose.model('Planta', plantaSchema, 'Plantas');

// Esquema de sensores
const sensorSchema = new mongoose.Schema({
  temperatura: String,
  humedad: String,
  aire: String,
  agua: String,
  tierra: String,
  luminocidad: String,
  ultrasonico: String,
  lluvia: String,
  timestamp: { type: Date, default: Date.now }
});

const Sensor = mongoose.model('Sensor', sensorSchema, 'Sensores');

// Middleware de autenticación
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// RUTAS DE USUARIO
app.post('/register', async (req, res) => {
  const { nombre_completo, correo, contraseña } = req.body; 
  if (!nombre_completo || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }
  const existingUser = await User.findOne({ correo });
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }
  const salt = await bcrypt.genSalt(10);
  const contraseñaHasheada = await bcrypt.hash(contraseña, salt);
  const newUser = new User({ nombre_completo, correo, contraseña: contraseñaHasheada });
  await newUser.save();
  res.status(201).json({ message: 'Usuario registrado correctamente' });
});

app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const user = await User.findOne({ correo });
  if (!user) {
    return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
  }
  const isValid = await bcrypt.compare(contraseña, user.contraseña);
  if (!isValid) {
    return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
  }
  const token = jwt.sign({ id: user._id, correo: user.correo }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
  res.json({ token, correo: user.correo, id: user._id, nombre_completo: user.nombre_completo });
});

// RUTAS DE PLANTAS
app.get('/plantas', async (req, res) => {
  try {
    const plantas = await Planta.find();
    res.json(plantas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las plantas' });
  }
});

// Obtener plantas de un usuario
app.get('/usuario-plantas/:id', verifyToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const todasLasPlantas = await Planta.find();
    const plantasUsuario = todasLasPlantas.filter(planta =>
      usuario.Plantas && usuario.Plantas.includes(planta.nombre)
    );

    res.json(plantasUsuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener plantas del usuario' });
  }
});

// Agregar planta a usuario
app.put('/usuario-planta', verifyToken, async (req, res) => {
  try {
    const { _idUsuario, _idPlanta } = req.body;

    const usuario = await User.findById(_idUsuario);
    const planta = await Planta.findById(_idPlanta);

    if (!usuario || !planta) {
      return res.status(404).json({ error: 'Usuario o planta no encontrados' });
    }

    if (!usuario.Plantas) {
      usuario.Plantas = [];
    }

    if (!usuario.Plantas.includes(planta.nombre)) {
      usuario.Plantas.push(planta.nombre);
      await usuario.save();
    }

    res.json({ message: 'Planta agregada al usuario', usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar planta al usuario' });
  }
});

// Quitar planta de usuario
app.delete('/usuario-planta/:userId/:plantaId', verifyToken, async (req, res) => {
  try {
    const { userId, plantaId } = req.params;

    const usuario = await User.findById(userId);
    const planta = await Planta.findById(plantaId);

    if (!usuario || !planta) {
      return res.status(404).json({ error: 'Usuario o planta no encontrados' });
    }

    if (usuario.Plantas && usuario.Plantas.includes(planta.nombre)) {
      usuario.Plantas = usuario.Plantas.filter(nombre => nombre !== planta.nombre);
      await usuario.save();
    }

    res.json({ message: 'Planta quitada del usuario', usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al quitar planta del usuario' });
  }
});

// RUTAS DE SENSORES
app.post('/sensores', async (req, res) => {
  try {
    const nuevoDato = new Sensor(req.body);
    await nuevoDato.save();
    res.status(201).json({ message: 'Dato guardado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar dato del sensor' });
  }
});

app.get('/sensores/ultimo', async (req, res) => {
  try {
    const ultimoDato = await Sensor.findOne().sort({ timestamp: -1 });
    if (!ultimoDato) {
      return res.status(404).json({ error: 'No hay datos de sensores aún' });
    }
    res.json(ultimoDato);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// RUTA DE BOMBA
app.get('/bomba', (req, res) => {
  res.send(estadoBomba);
});

app.post('/bomba', (req, res) => {
  const { estado } = req.body;
  if (estado === "on" || estado === "off") {
    estadoBomba = estado;
    console.log("Bomba cambiada a:", estadoBomba);
    res.send("OK");
  } else {
    res.status(400).send("Estado inválido");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
