import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Planta = {
  _id: string;
  nombre: string;
  temperaturaideal: number;
  humedadideal: number;
  aireideal: number;
  aguaideal: number;
  tierraideal: number;
  luminocidadideal: number;
};

type SensorData = {
  temperatura: number;
  humedad: number;
  aire: string;
  tierra: number;
  luminocidad: number;
};

const API_BASE_URL = 'https://apis-smartgarden.onrender.com';

export default function EstadoPlantas() {
  const [plantasUsuario, setPlantasUsuario] = useState<Planta[]>([]);
  const [plantasDisponibles, setPlantasDisponibles] = useState<Planta[]>([]);
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState<Planta | null>(null);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarPlantasUsuario();
  }, []);

  const cargarPlantasUsuario = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('No estás autenticado');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usuario-plantas/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener plantas del usuario');
      }

      const data = await response.json();
      setPlantasUsuario(data);
      
      if (data.length > 0) {
        setPlantaSeleccionada(data[0]);
        cargarDatosSensor();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al cargar plantas');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarPlantasDisponibles = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setError('No estás autenticado');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/plantas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener plantas disponibles');
      }

      const data = await response.json();
      setPlantasDisponibles(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al cargar plantas disponibles');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosSensor = async () => {
    if (!plantaSeleccionada) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sensores/ultimo`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del sensor');
      }

      const sensorData = await response.json();
      setSensor({
        temperatura: Number(sensorData.temperatura),
        humedad: Number(sensorData.humedad),
        aire: sensorData.aire,
        tierra: Number(sensorData.tierra),
        luminocidad: Number(sensorData.luminocidad),
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al cargar datos del sensor');
      }
    } finally {
      setLoading(false);
    }
  };

  const agregarPlantaUsuario = async (plantaId: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('No estás autenticado');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usuario-planta`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _idUsuario: userId,
          _idPlanta: plantaId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar planta');
      }

      await cargarPlantasUsuario();
      setModalVisible(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al agregar planta');
      }
    } finally {
      setLoading(false);
    }
  };

  const quitarPlantaUsuario = async (plantaId: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('No estás autenticado');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usuario-planta/${userId}/${plantaId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al quitar planta');
      }

      await cargarPlantasUsuario();
      
      if (plantaSeleccionada?._id === plantaId) {
        setPlantaSeleccionada(plantasUsuario.length > 1 ? 
          plantasUsuario.find(p => p._id !== plantaId) || null : null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al quitar planta');
      }
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAgregar = async () => {
    await cargarPlantasDisponibles();
    setModalVisible(true);
  };

  const plantasParaAgregar = plantasDisponibles.filter(
    planta => !plantasUsuario.some(p => p._id === planta._id)
  ).filter(
    planta => planta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Plantas</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity 
        style={styles.botonAgregar} 
        onPress={abrirModalAgregar}
        disabled={loading}
      >
        <Text style={styles.textoBoton}>+ Agregar Planta</Text>
      </TouchableOpacity>

      {loading && !modalVisible ? (
        <ActivityIndicator size="large" color="#2e7d32" />
      ) : plantasUsuario.length === 0 ? (
        <Text style={styles.sinPlantas}>No tienes plantas registradas</Text>
      ) : (
        <FlatList
          data={plantasUsuario}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={[
              styles.tarjetaPlanta,
              plantaSeleccionada?._id === item._id && styles.tarjetaSeleccionada
            ]}>
              <TouchableOpacity 
                style={styles.contenidoTarjeta}
                onPress={() => setPlantaSeleccionada(item)}
              >
                <Text style={styles.nombrePlanta}>{item.nombre}</Text>
                <TouchableOpacity onPress={() => quitarPlantaUsuario(item._id)}>
                  <Text style={styles.iconoEliminar}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {plantaSeleccionada?._id === item._id && (
                <View style={styles.datosSensor}>
                  {sensor ? (
                    <>
                      <Text>Temperatura: {sensor.temperatura}°C (Ideal: {item.temperaturaideal}°C)</Text>
                      <Text>Humedad: {sensor.humedad}% (Ideal: {item.humedadideal}%)</Text>
                      <Text>Calidad Aire: {sensor.aire} (Ideal: {item.aireideal})</Text>
                      <Text>Humedad Tierra: {sensor.tierra} (Ideal: {item.tierraideal})</Text>
                      <Text>Luminosidad: {sensor.luminocidad} (Ideal: {item.luminocidadideal})</Text>
                    </>
                  ) : (
                    <Text>No hay datos del sensor</Text>
                  )}
                </View>
              )}
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.tituloModal}>Agregar Planta</Text>
            
            <TextInput
              placeholder="Buscar plantas..."
              style={styles.buscador}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#2e7d32" />
            ) : plantasParaAgregar.length === 0 ? (
              <Text style={styles.sinResultados}>No hay plantas disponibles</Text>
            ) : (
              <FlatList
                data={plantasParaAgregar}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.itemPlanta}
                    onPress={() => agregarPlantaUsuario(item._id)}
                  >
                    <Text style={styles.nombrePlantaModal}>{item.nombre}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.botonCerrarModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBoton}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  botonAgregar: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
  },
  sinPlantas: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  tarjetaPlanta: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  tarjetaSeleccionada: {
    borderColor: '#2e7d32',
    borderWidth: 2,
  },
  contenidoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombrePlanta: {
    fontSize: 18,
    fontWeight: '500',
  },
  iconoEliminar: {
    fontSize: 20,
  },
  datosSensor: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2e7d32',
  },
  buscador: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  itemPlanta: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nombrePlantaModal: {
    fontSize: 16,
  },
  sinResultados: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  botonCerrarModal: {
    backgroundColor: '#757575',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
});