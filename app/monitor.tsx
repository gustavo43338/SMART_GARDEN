import SensorCard from '@/components/SensorCard';
import { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

// ✅ IP del backend corregida
const API_URL = 'http://192.168.100.10:3000/sensores/ultimo';

export default function Monitor() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [datos, setDatos] = useState({
    temperatura: '--',
    humedad: '--',
    aire: '--',
    agua: '--',
    tierra: '--',
    luminocidad: '--',
  });

  const [loading, setLoading] = useState(false);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('No se pudo obtener los datos del servidor');
      const data = await response.json();
      setDatos({
        temperatura: data.temperatura || '--',
        humedad: data.humedad || '--',
        aire: data.aire || '--',
        agua: data.agua || '--',
        tierra: data.tierra || '--',
        luminocidad: data.luminocidad || '--',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudieron obtener los datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  const activarBomba = async () => {
    try {
      // Aquí puedes agregar lógica para enviar una petición a tu ESP32 o backend
      Alert.alert('Éxito', '¡Bomba activada!');
    } catch (err) {
      Alert.alert('Error', 'Error al activar bomba');
    }
  };

  useEffect(() => {
    obtenerDatos(); // Carga inicial
    const interval = setInterval(obtenerDatos, 5000); // Refresca cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={obtenerDatos} />
      }
    >
      <Text style={styles.title}>🌿 Monitor de Jardín Inteligente</Text>
      <View style={styles.cardsContainer}>
        <SensorCard titulo="Temperatura" valor={`${datos.temperatura} °C`} />
        <SensorCard titulo="Humedad Ambiental" valor={`${datos.humedad} %`} />
        <SensorCard titulo="Calidad del Aire" valor={datos.aire} />
        <SensorCard titulo="Nivel de Agua" valor={datos.agua} />
        <SensorCard titulo="Humedad del Suelo" valor={`${datos.tierra} %`} />
        <SensorCard titulo="Luminocidad" valor={`${datos.luminocidad} lx`} />
      </View>

      <TouchableOpacity style={styles.button} onPress={activarBomba}>
        <Text style={styles.buttonText}>💧 Activar Bomba de Agua</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
  style={styles.navigateButton}
  onPress={() => navigation.navigate('AgregarPlanta')}
>
  <Text style={styles.navigateButtonText}>🌱 Agregar Nueva Planta</Text>
</TouchableOpacity>


      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => navigation.navigate('EstadoPlantas')}
      >
        <Text style={styles.navigateButtonText}>🌿 Ver Estado de Plantas</Text>
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
  cardsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#388e3c',
    paddingVertical: 16, 
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  navigateButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 3,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
