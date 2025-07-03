import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const historialSimulado = [
  {
    fecha: '2025-07-02 10:00',
    planta: 'Menta',
    sensores: {
      temperatura: 24.1,
      humedad: 65,
      tierra: 45,
      aire: 'Bueno',
      agua: 'Medio',
    },
  },
  {
    fecha: '2025-07-02 10:00',
    planta: 'Lavanda',
    sensores: {
      temperatura: 22.7,
      humedad: 60,
      tierra: 55,
      aire: 'Regular',
      agua: 'Alto',
    },
  },
  {
    fecha: '2025-07-02 10:00',
    planta: 'Albahaca',
    sensores: {
      temperatura: 25.3,
      humedad: 68,
      tierra: 40,
      aire: 'Malo',
      agua: 'Bajo',
    },
  },
];

export default function HistorialPlantas() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📜 Historial de Estado de Plantas</Text>
      {historialSimulado.map((registro, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.fecha}>🕒 {registro.fecha}</Text>
          <Text style={styles.nombre}>{registro.planta}</Text>
          <Text>🌡️ Temperatura: {registro.sensores.temperatura} °C</Text>
          <Text>💧 Humedad: {registro.sensores.humedad} %</Text>
          <Text>🌍 Suelo: {registro.sensores.tierra} %</Text>
          <Text>🌬️ Aire: {registro.sensores.aire}</Text>
          <Text>🚰 Agua: {registro.sensores.agua}</Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  fecha: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1b5e20',
  },
});
