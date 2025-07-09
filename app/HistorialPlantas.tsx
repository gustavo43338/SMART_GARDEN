import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SensorCard from '@/components/SensorCard'; // Ajusta la ruta si es necesario

// Definición de tipos
interface SensorData {
  temperatura: number;
  humedad: number;
  tierra: number;
  aire: string;
  agua: string;
  luminocidad: number;
}

interface RegistroHistorial {
  fecha: string;
  planta: string;
  sensores: SensorData;
}

const generarRegistroSimulado = (planta: string): RegistroHistorial => ({
  fecha: new Date().toISOString(),
  planta,
  sensores: {
    temperatura: parseFloat((18 + Math.random() * 15).toFixed(1)),
    humedad: parseFloat((20 + Math.random() * 80).toFixed(0)),
    tierra: parseFloat((20 + Math.random() * 60).toFixed(0)),
    aire: ['Bueno', 'Regular', 'Malo'][Math.floor(Math.random() * 3)],
    agua: ['Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 3)],
    luminocidad: parseFloat((100 + Math.random() * 900).toFixed(0)),
  },
});

const evaluar = (tipo: string, valor: number | string): string => {
  if (typeof valor === 'string') return valor;
  switch (tipo) {
    case 'temperatura':
      return valor < 18 ? 'Baja' : valor > 30 ? 'Alta' : 'Óptima';
    case 'humedad':
      return valor < 40 ? 'Baja' : valor > 70 ? 'Alta' : 'Óptima';
    case 'tierra':
      return valor < 30 ? 'Seca' : valor > 70 ? 'Muy Húmeda' : 'Óptima';
    case 'luminocidad':
      if (valor < 200) return 'Muy Baja';
      if (valor < 500) return 'Baja';
      if (valor < 800) return 'Óptima';
      return 'Alta';
    default:
      return '--';
  }
};

// Función para formatear la fecha
const formatearFecha = (fecha: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const date = new Date(fecha);
  return date.toLocaleString('es-MX', options).replace(',', ''); // Formato en español
};

export default function HistorialPlantas() {
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]); // Especificamos el tipo aquí

  useEffect(() => {
    const plantas = ['Menta', 'Lavanda', 'Albahaca'];
    const interval = setInterval(() => {
      const nuevosRegistros = plantas.map(generarRegistroSimulado);
      setHistorial(prevHistorial => [...prevHistorial, ...nuevosRegistros]);
    }, 5000); // Actualiza cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📜 Historial de Estado de Plantas</Text>
      {historial.map((registro, index) => (
        <View key={index} style={styles.plantaCard}>
          <Text style={styles.fecha}>🕒 {formatearFecha(registro.fecha)}</Text>
          <Text style={styles.nombre}>{registro.planta}</Text>
          <View style={styles.sensoresContainer}>
            <SensorCard
              titulo="Temperatura"
              valor={evaluar('temperatura', registro.sensores.temperatura)}
            />
            <SensorCard
              titulo="Humedad Ambiental"
              valor={evaluar('humedad', registro.sensores.humedad)}
            />
            <SensorCard
              titulo="Humedad del Suelo"
              valor={evaluar('tierra', registro.sensores.tierra)}
            />
            <SensorCard titulo="Calidad del Aire" valor={registro.sensores.aire} />
            <SensorCard titulo="Nivel de Agua" valor={registro.sensores.agua} />
            <SensorCard
              titulo="Luminocidad"
              valor={evaluar('luminocidad', registro.sensores.luminocidad)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f4ea',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 24,
    textAlign: 'center',
  },
  plantaCard: {
    marginBottom: 24,
    backgroundColor: '#f5fff7',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },
  fecha: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1b5e20',
    textAlign: 'center',
  },
  sensoresContainer: {
    gap: 12,
  },
});
