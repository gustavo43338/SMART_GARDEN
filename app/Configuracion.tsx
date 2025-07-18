import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';

export default function Configuracion() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState(true);

  const toggleNotificaciones = () => setNotificaciones((prev) => !prev);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <View style={styles.option}>
        <Text style={styles.optionText}>Notificaciones</Text>
        <Switch value={notificaciones} onValueChange={toggleNotificaciones} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('Cerrar sesión', '¿Quieres cerrar sesión?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí', onPress: () => router.push('/login') },
        ])}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d0ecec',
    padding: 30,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#81c784',
  },
  optionText: {
    fontSize: 18,
    color: '#2e7d32',
  },
  button: {
    marginTop: 50,
    backgroundColor: '#43a047',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#e0f2f1',
    fontSize: 18,
    fontWeight: '700',
  },
});
