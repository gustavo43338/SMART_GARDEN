import SensorCard from '@/components/SensorCard';
import { useEffect, useState, useRef } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

const API_URL = 'http://192.168.100.10:3000/sensores/ultimo'; 
const API_BOMBA_URL = 'http://192.168.100.10:3000/bomba';

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
  const [estadoBomba, setEstadoBomba] = useState<"on" | "off">("off");

  // Animaciones para botones bomba
  const scaleAnimOn = useRef(new Animated.Value(1)).current;
  const scaleAnimOff = useRef(new Animated.Value(1)).current;

  const animatePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('No se pudo obtener los datos del servidor');
      const data = await response.json();
      setDatos({
        temperatura: data.temperatura ?? '--',
        humedad: data.humedad ?? '--',
        aire: data.aire ?? '--',
        agua: data.agua ?? '--',
        tierra: data.tierra ?? '--',
        luminocidad: data.luminocidad ?? '--',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudieron obtener los datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoBomba = async (nuevoEstado: "on" | "off") => {
    try {
      const res = await fetch(API_BOMBA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        setEstadoBomba(nuevoEstado);
        Alert.alert("Bomba", `Se ha ${nuevoEstado === "on" ? "encendido" : "apagado"} la bomba.`);
      } else {
        Alert.alert("Error", "No se pudo cambiar el estado.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  const activarBomba = () => cambiarEstadoBomba("on");
  const desactivarBomba = () => cambiarEstadoBomba("off");

  useEffect(() => {
    obtenerDatos();
    const interval = setInterval(obtenerDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={obtenerDatos} colors={['#4caf50']} />
      }
      showsVerticalScrollIndicator={false}
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

      <View style={styles.buttonsRow}>
        <Animated.View style={{ transform: [{ scale: scaleAnimOn }], flex: 1, marginRight: 10 }}>
          <TouchableOpacity
            style={[styles.buttonOn, estadoBomba === "on" && styles.buttonActive]}
            onPressIn={() => animatePressIn(scaleAnimOn)}
            onPressOut={() => animatePressOut(scaleAnimOn)}
            onPress={activarBomba}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>💧 Activar Bomba</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scaleAnimOff }], flex: 1, marginLeft: 10 }}>
          <TouchableOpacity
            style={[styles.buttonOff, estadoBomba === "off" && styles.buttonActive]}
            onPressIn={() => animatePressIn(scaleAnimOff)}
            onPressOut={() => animatePressOut(scaleAnimOff)}
            onPress={desactivarBomba}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🚫 Apagar Bomba</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.estado}>Estado actual: <Text style={{fontWeight: 'bold', color: estadoBomba === 'on' ? '#28a745' : '#c62828'}}>{estadoBomba.toUpperCase()}</Text></Text>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => navigation.navigate('AgregarPlanta')}
          activeOpacity={0.85}
        >
          <Text style={styles.navigateButtonText}>🌱 Agregar Nueva Planta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => navigation.navigate('EstadoPlantas')}
          activeOpacity={0.85}
        >
          <Text style={styles.navigateButtonText}>🌿 Ver Estado de Plantas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f5faf6',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 0.7,
  },
  cardsContainer: {
    marginBottom: 35,
    gap: 16,
    // Para Android sin gap: usa margin en SensorCard componente o FlatList
  },
  buttonsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  buttonOn: {
    backgroundColor: '#43a047',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  buttonOff: {
    backgroundColor: '#c62828',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#8b0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  buttonActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  estado: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#444',
  },
  navigationButtons: {
    gap: 15,
  },
  navigateButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 10,
  },
  navigateButtonText: {
    color: '#e8f5e9',
    fontSize: 18,
    fontWeight: '600',
  },
});
