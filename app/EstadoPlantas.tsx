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

import SensorCard from '@/components/SensorCard'; // Ajusta la ruta si es necesario

type Estándares = {
  temperatura: { óptimo: number[]; medio: number[]; malo: number[] };
  humedad: { óptimo: number[]; medio: number[]; malo: number[] };
  tierra: { óptimo: number[]; medio: number[]; malo: number[] };
  luminocidad: { óptimo: number[]; medio: number[]; malo: number[] };
};

type Planta = {
  nombre: string;
  sensores: {
    temperatura: number;
    humedad: number;
    tierra: number;
    aire: string;
    agua: string;
    luminocidad: number;  // agregado
  };
  estandares: Estándares;
};

// Definir un tipo para los tipos de sensores
type TipoSensor = 'temperatura' | 'humedad' | 'tierra' | 'luminocidad';

const evaluar = (tipo: TipoSensor, valor: number | string, estandares: Estándares): string => {
  if (typeof valor === 'string') return valor;

  const { óptimo, medio, malo } = estandares[tipo];

  if (valor < malo[0] || (malo.length > 1 && valor > malo[1])) return 'Malo';
  if (valor >= medio[0] && (medio.length === 1 || valor <= medio[1])) return 'Medio';
  if (valor >= óptimo[0] && (óptimo.length === 1 || valor <= óptimo[1])) return 'Óptimo';

  return '--';
};

const generarSensores = () => ({
  temperatura: parseFloat((18 + Math.random() * 15).toFixed(1)),
  humedad: parseFloat((20 + Math.random() * 80).toFixed(0)),
  tierra: parseFloat((20 + Math.random() * 60).toFixed(0)),
  aire: ['Bueno', 'Regular', 'Malo'][Math.floor(Math.random() * 3)],
  agua: ['Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 3)],
  luminocidad: parseFloat((100 + Math.random() * 900).toFixed(0)),
});

const plantasIniciales: Planta[] = [
  {
    nombre: 'Menta',
    sensores: generarSensores(),
    estandares: {
      temperatura: { óptimo: [18, 24], medio: [15, 17], malo: [25, 30] },
      humedad: { óptimo: [40, 60], medio: [30, 39], malo: [61, 70] },
      tierra: { óptimo: [30, 50], medio: [20, 29], malo: [51, 70] },
      luminocidad: { óptimo: [400, 800], medio: [200, 399], malo: [801, 1000] },
    },
  },
  {
    nombre: 'Lavanda',
    sensores: generarSensores(),
    estandares: {
      temperatura: { óptimo: [20, 25], medio: [15, 19], malo: [26, 30] },
      humedad: { óptimo: [30, 50], medio: [20, 29], malo: [51, 70] },
      tierra: { óptimo: [30, 60], medio: [20, 29], malo: [61, 70] },
      luminocidad: { óptimo: [300, 700], medio: [200, 299], malo: [701, 1000] },
    },
  },
  {
    nombre: 'Albahaca',
    sensores: generarSensores(),
    estandares: {
      temperatura: { óptimo: [20, 30], medio: [15, 19], malo: [31, 35] },
      humedad: { óptimo: [50, 70], medio: [40, 49], malo: [71, 80] },
      tierra: { óptimo: [40, 60], medio: [30, 39], malo: [61, 70] },
      luminocidad: { óptimo: [500, 900], medio: [300, 499], malo: [901, 1000] },
    },
  },
];

export default function EstadoPlantas() {
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const obtenerDatos = () => {
      const nuevasPlantas = plantasIniciales.map(planta => ({
        ...planta,
        sensores: generarSensores(),
      }));
      setPlantas(nuevasPlantas);
    };

    obtenerDatos();
    const interval = setInterval(obtenerDatos, 5000); // Actualiza cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌿 Estado Actual de las Plantas</Text>

      {plantas.map((planta, index) => (
        <View key={index} style={styles.plantaCard}>
          <Text style={styles.nombre}>{planta.nombre}</Text>
          <View style={styles.sensoresContainer}>
            <SensorCard
              titulo="Temperatura"
              valor={evaluar('temperatura', planta.sensores.temperatura, planta.estandares)}
            />
            <SensorCard
              titulo="Humedad Ambiental"
              valor={evaluar('humedad', planta.sensores.humedad, planta.estandares)}
            />
            <SensorCard
              titulo="Humedad del Suelo"
              valor={evaluar('tierra', planta.sensores.tierra, planta.estandares)}
            />
            <SensorCard titulo="Calidad del Aire" valor={planta.sensores.aire} />
            <SensorCard titulo="Nivel de Agua" valor={planta.sensores.agua} />
            <SensorCard
              titulo="Luminocidad"
              valor={evaluar('luminocidad', planta.sensores.luminocidad, planta.estandares)}
            />
          </View>
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
  plantaCard: {
    marginBottom: 24,
    backgroundColor: '#f5fff7',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
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
