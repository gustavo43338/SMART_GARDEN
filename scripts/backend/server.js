require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

//  Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Conectado a MongoDB Atlas'))
  .catch(err => console.error(' Error al conectar a MongoDB:', err));

// 🧍‍♂️ Esquema de usuarios
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true }
});
const User = mongoose.model('User', userSchema, 'Usuarios');

//  Esquema de plantas
const plantaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  temperatura: { type: Number, required: true },
  humedad: { type: Number, required: true },
  tierra: { type: Number, required: true },
  aire: { type: String, required: true },
  luminocidad: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Planta = mongoose.model('Planta', plantaSchema, 'Plantas');

//  Esquema de sensores
const sensorSchema = new mongoose.Schema({
  temperatura: String,
  humedad: String,
  aire: String,
  agua: String,
  tierra: String,
  luminocidad: String,
  timestamp: { type: Date, default: Date.now }
});
const Sensor = mongoose.model('Sensor', sensorSchema, 'Sensores');

// Middleware de debug (opcional)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log('Body:', req.body);
  next();
});

//  AUTENTICACIÓN

//  Registro
app.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
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

  const newUser = new User({ nombre, correo, contraseña: contraseñaHasheada });
  await newUser.save();

  res.status(201).json({ message: 'Usuario registrado correctamente' });
});

//  Login
app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const user = await User.findOne({ correo });
  console.log(user)
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

  res.json({ token, correo: user.correo });
});

//  Ruta protegida (opcional)
app.get('/perfil', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-contraseña');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  res.json(user);
});

//  Middleware para verificar token JWT
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



// POST - Agregar nueva planta
app.post('/plantas', async (req, res) => {
  try {
    const nuevaPlanta = new Planta(req.body);
    await nuevaPlanta.save();
    res.status(201).json({ message: 'Planta agregada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar planta' });
  }
});



// POST - Recibir datos del sensor (ESP32)
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

// GET - Obtener el último dato del sensor
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

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Servidor corriendo en puerto ${PORT}`));
