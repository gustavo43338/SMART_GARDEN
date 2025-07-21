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

let estadoBomba = "off"; // Estado inicial

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Esquema de usuarios con campos para recuperación de contraseña
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model('User', userSchema, 'Usuarios');

// Esquema de plantas (modificado con los campos solicitados)
const plantaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },           // Nombre común y científico
  tipo: { type: String, required: true },             // Tipo de planta (e.g., suculenta, hierba, arbusto)
  humedad: { type: Number, required: true },          // Humedad (%)
  luminosidad: { type: Number, required: true },      // Nivel de luz en lux (numérico)
  calidadAire: { type: String, required: true },      // Calidad del aire (ej. CO2: 400ppm)
  temperatura: { type: Number, required: true },      // Temperatura en °C o °F
  timestamp: { type: Date, default: Date.now }
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
  timestamp: { type: Date, default: Date.now }
});
const Sensor = mongoose.model('Sensor', sensorSchema, 'Sensores');

// Middleware de debug (opcional)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Configura nodemailer con Gmail SMTP (o cualquier SMTP que uses)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // tu correo gmail
    pass: process.env.GMAIL_PASS, // tu contraseña o app password
  },
});

// AUTENTICACIÓN

// Registro
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

// Login
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

  res.json({ token, correo: user.correo });
});

// Ruta protegida (opcional)
app.get('/perfil', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-contraseña -resetPasswordToken -resetPasswordExpire');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  res.json(user);
});

// Middleware para verificar token JWT
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

// RECUPERAR CONTRASEÑA - enviar correo con token

app.post('/recuperar', async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  const user = await User.findOne({ correo });
  if (!user) {
    // No revelamos si existe o no para seguridad
    return res.status(200).json({ message: 'Si el correo está registrado, se enviará un enlace para recuperar la contraseña.' });
  }

  // Generar token único y expiración (1 hora)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpire = Date.now() + 3600000; // 1 hora ms

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = resetTokenExpire;
  await user.save();

  // Enlace para la app o web que tendrá el token (ajusta URL)
  const resetUrl = `http://tuapp.com/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: correo,
    subject: 'Recuperación de contraseña - Smart Garden',
    text: `Para restablecer tu contraseña, visita este enlace: ${resetUrl}\nSi no solicitaste este cambio, ignora este correo.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al enviar el correo' });
    }
    res.json({ message: 'Correo de recuperación enviado' });
  });
});

// Cambiar contraseña con token
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { nuevaContraseña } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
  }

  const salt = await bcrypt.genSalt(10);
  user.contraseña = await bcrypt.hash(nuevaContraseña, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: 'Contraseña restablecida correctamente' });
});

// POST - Agregar nueva planta (con validación básica)
app.post('/plantas', async (req, res) => {
  try {
    const { nombre, tipo, humedad, luminosidad, calidadAire, temperatura } = req.body;

    if (
      !nombre ||
      !tipo ||
      humedad == null ||
      luminosidad == null ||
      !calidadAire ||
      temperatura == null
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const nuevaPlanta = new Planta({ nombre, tipo, humedad, luminosidad, calidadAire, temperatura });
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

// Obtener el estado de la bomba
app.get('/bomba', (req, res) => {
  res.send(estadoBomba);
});

// Cambiar el estado
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

// NUEVA RUTA para obtener solo los nombres de las plantas
app.get('/plantas', async (req, res) => {
  try {
    const plantas = await Planta.find({}, 'nombre'); // solo campo nombre
    res.json(plantas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las plantas' });
  }
});

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
