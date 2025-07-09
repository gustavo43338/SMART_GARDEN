require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

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

let bombaEncendida = false;

app.post('/bomba/encender', (req, res) => {
  bombaEncendida = true;
  console.log("🔥 Bomba ENCENDIDA desde la app");
  res.json({ message: 'Bomba encendida' });
});

app.post('/bomba/apagar', (req, res) => {
  bombaEncendida = false;
  console.log("💧 Bomba APAGADA desde la app");
  res.json({ message: 'Bomba apagada' });
});

app.get('/bomba/estado', (req, res) => {
  res.json({ encendida: bombaEncendida });
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
