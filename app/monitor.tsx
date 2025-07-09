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
import { RootStackParamList } from './App'; // Ajusta si es necesario

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
      const response = await fetch('http://192.168.1.203:3000/sensores/ultimo');
      const json = await response.json();
      if (json) {
        setDatos({
          temperatura: json.temperatura || '--',
          humedad: json.humedad || '--',
          aire: json.aire || '--',
          agua: json.agua || '--',
          tierra: json.tierra || '--',
          luminocidad: json.luminocidad || '--',
        });
      } else {
        Alert.alert('Error', 'No se encontraron datos del sensor');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudieron obtener los datos del servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activarBomba = async () => {
    try {
      const response = await fetch('http://192.168.1.203:3000/bomba/encender', {
        method: 'POST',
      });
      const json = await response.json();
      Alert.alert('Bomba', json.message || 'Bomba activada');
    } catch (err) {
      Alert.alert('Error', 'Error al activar bomba');
      console.error(err);
    }
  };

  const apagarBomba = async () => {
    try {
      const response = await fetch('http://192.168.1.203:3000/bomba/apagar', {
        method: 'POST',
      });
      const json = await response.json();
      Alert.alert('Bomba', json.message || 'Bomba apagada');
    } catch (err) {
      Alert.alert('Error', 'Error al apagar bomba');
      console.error(err);
    }
  };

  useEffect(() => {
    obtenerDatos();
    const interval = setInterval(obtenerDatos, 5000);
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

      <TouchableOpacity style={styles.offButton} onPress={apagarBomba}>
        <Text style={styles.buttonText}>🛑 Apagar Bomba</Text>
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
  offButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
