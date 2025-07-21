import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextStyle } from 'react-native';

type Planta = {
  nombre: string;
  tipo: string;
  humedad: number;      // Ideal humedad para planta (%)
  luminosidad: number;  // Ideal lux para planta
  calidadAire: string;  // Calidad ideal (ejemplo: "400")
  temperatura: number;  // Ideal temperatura para planta (°C)
};

type SensorData = {
  temperatura: number;
  humedad: number;
  aire: string;
  tierra: number;
  luminocidad: number;
};

const API_PLANTAS_URL = 'http://192.168.100.10:3000/plantas';
const API_SENSORES_URL = 'http://192.168.100.10:3000/sensores/ultimo';

// ✅ RANGOS PERSONALIZADOS POR TIPO DE PLANTA
const rangosLuminosidad: Record<string, { min: number; max: number }> = {
  suculenta: { min: 500, max: 1000 },
  hierba: { min: 300, max: 700 },
  arbusto: { min: 400, max: 900 },
};

// ✅ Evaluar luminosidad según tipo de planta
function evaluarLuminosidadPorTipo(lux: number, tipo: string): string {
  const rango = rangosLuminosidad[tipo] || { min: 300, max: 700 };
  if (lux < rango.min) return 'Mala';
  if (lux > rango.max) return 'Mala';
  if (lux < rango.max - (rango.max - rango.min) * 0.3) return 'Buena';
  return 'Óptima';
}

// Función para evaluar estado genérico por porcentaje de tolerancia
function evaluarParametro(actual: number, ideal: number, toleranciaPorc = 20): string {
  const delta = Math.abs(actual - ideal);
  const tolerancia = (ideal * toleranciaPorc) / 100;

  if (delta > tolerancia) {
    if (actual < ideal) return 'Mala';
    else return 'Buena';
  }
  return 'Óptima';
}

// Evaluar calidad de aire simplificada
function evaluarCalidadAire(actual: string, ideal: string): string {
  const actualNum = parseInt(actual, 10);
  const idealNum = parseInt(ideal, 10);
  if (isNaN(actualNum) || isNaN(idealNum)) return 'Desconocida';
  const diff = Math.abs(actualNum - idealNum);

  if (diff > 100) {
    if (actualNum > idealNum) return 'Mala';
    else return 'Buena';
  }
  return 'Óptima';
}

export default function EstadoPlantas() {
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [resPlantas, resSensor] = await Promise.all([
          fetch(API_PLANTAS_URL),
          fetch(API_SENSORES_URL),
        ]);

        if (!resPlantas.ok) throw new Error('Error al obtener plantas');
        if (!resSensor.ok) throw new Error('Error al obtener datos del sensor');

        const plantasJson: Planta[] = await resPlantas.json();
        const sensorJson = await resSensor.json();

        const sensorData: SensorData = {
          temperatura: Number(sensorJson.temperatura),
          humedad: Number(sensorJson.humedad),
          aire: sensorJson.aire,
          tierra: Number(sensorJson.tierra),
          luminocidad: Number(sensorJson.luminocidad),
        };

        setPlantas(plantasJson);
        setSensor(sensorData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
    const interval = setInterval(obtenerDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (!sensor || plantas.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Estado de Plantas y Sensores</Text>

      {plantas.map((planta, i) => (
        <View key={i} style={styles.plantaCard}>
          <Text style={styles.plantaNombre}>{planta.nombre}</Text>

          <Text style={styles.parametro}>
            Temperatura: {sensor.temperatura} °C -{' '}
            <Text style={estiloEvaluacion(evaluarParametro(sensor.temperatura, planta.temperatura))}>
              {evaluarParametro(sensor.temperatura, planta.temperatura)}
            </Text>
          </Text>

          <Text style={styles.parametro}>
            Calidad del Aire: {sensor.aire} ppm -{' '}
            <Text style={estiloEvaluacion(evaluarCalidadAire(sensor.aire, planta.calidadAire))}>
              {evaluarCalidadAire(sensor.aire, planta.calidadAire)}
            </Text>
          </Text>

          <Text style={styles.parametro}>
            Humedad del Suelo: {sensor.tierra} % -{' '}
            <Text style={estiloEvaluacion(evaluarParametro(sensor.tierra, planta.humedad))}>
              {evaluarParametro(sensor.tierra, planta.humedad)}
            </Text>
          </Text>

          <Text style={styles.parametro}>
            Luminocidad: {sensor.luminocidad} lx -{' '}
            <Text style={estiloEvaluacion(evaluarLuminosidadPorTipo(sensor.luminocidad, planta.tipo))}>
              {evaluarLuminosidadPorTipo(sensor.luminocidad, planta.tipo)}
            </Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const estiloEvaluacion = (evalStr: string): TextStyle => {
  switch (evalStr) {
    case 'Óptima':
      return { color: '#2e7d32', fontWeight: '700' };
    case 'Buena':
      return { color: '#fbc02d', fontWeight: '700' };
    case 'Mala':
      return { color: '#c62828', fontWeight: '700' };
    default:
      return { color: '#555' };
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f4ea',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
    textAlign: 'center',
  },
  plantaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
  },
  plantaNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  parametro: {
    fontSize: 16,
    marginBottom: 4,
  },
});
