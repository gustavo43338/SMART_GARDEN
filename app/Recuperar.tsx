import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function Recuperar() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!correo) {
      Alert.alert('Error', 'Por favor ingresa tu correo.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.100.10:3000/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();
      Alert.alert('Recuperación', data.message || 'Verifica tu correo.');
      setCorreo('');
      router.push('/');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Hubo un problema al intentar recuperar tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Recuperar contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        placeholderTextColor="#555555"  // gris oscuro suave
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity style={styles.button} onPress={onSend} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.back}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#2e7d32',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fafafa',
    marginBottom: 20,
    fontSize: 18,
    color: '#222222',
    // sombra suave para dar profundidad
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  button: {
    backgroundColor: '#388e3c',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  back: {
    marginTop: 20,
    color: '#4a4a4a',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
});
