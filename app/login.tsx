import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validarCampos = () => {
    if (!correo || !contraseña) {
      setError('Todos los campos son obligatorios.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('El correo no es válido.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError('');

    if (!validarCampos()) return;

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.203:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      console.log(data)

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        router.replace('/home');
      } else {
        setError(data.error || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setError('Error de conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Image
        source={require('../assets/images/jardin-header.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>🌱 Bienvenido de nuevo</Text>

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.form}>
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#777"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#777"
          style={styles.input}
          secureTextEntry
          value={contraseña}
          onChangeText={setContraseña}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: '100%',
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#388e3c',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    color: '#1b5e20',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
