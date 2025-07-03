import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

type Planta = {
  nombre: string;
  sensores: {
    temperatura: number;
    humedad: number;
    tierra: number;
    aire: string;
    agua: string;
  };
};

const evaluar = (tipo: string, valor: number | string): string => {
  if (typeof valor === 'string') return valor;
  switch (tipo) {
    case 'temperatura':
      return valor < 18 ? 'Baja' : valor > 30 ? 'Alta' : 'Óptima';
    case 'humedad':
      return valor < 40 ? 'Baja' : valor > 70 ? 'Alta' : 'Óptima';
    case 'tierra':
      return valor < 30 ? 'Seca' : valor > 70 ? 'Muy Húmeda' : 'Óptima';
    default:
      return '--';
  }
};

const generarSensores = () => ({
  temperatura: parseFloat((18 + Math.random() * 15).toFixed(1)),
  humedad: parseFloat((30 + Math.random() * 50).toFixed(0)),
  tierra: parseFloat((20 + Math.random() * 60).toFixed(0)),
  aire: ['Bueno', 'Regular', 'Malo'][Math.floor(Math.random() * 3)],
  agua: ['Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 3)],
});

export default function EstadoPlantas() {
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const nuevasPlantas: Planta[] = [
      { nombre: 'Menta', sensores: generarSensores() },
      { nombre: 'Lavanda', sensores: generarSensores() },
      { nombre: 'Albahaca', sensores: generarSensores() },
    ];
    setPlantas(nuevasPlantas);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌿 Estado Actual de las Plantas</Text>
      {plantas.map((planta, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.nombre}>{planta.nombre}</Text>
          <Text>🌡️ Temperatura: {evaluar('temperatura', planta.sensores.temperatura)}</Text>
          <Text>💧 Humedad Ambiental: {evaluar('humedad', planta.sensores.humedad)}</Text>
          <Text>🌍 Humedad del Suelo: {evaluar('tierra', planta.sensores.tierra)}</Text>
          <Text>🌬️ Calidad del Aire: {planta.sensores.aire}</Text>
          <Text>🚰 Nivel de Agua: {planta.sensores.agua}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HistorialPlantas')}
      >
        <Text style={styles.buttonText}>📜 Ver Historial</Text>
      </TouchableOpacity>
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
  nombre: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1b5e20',
  },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
