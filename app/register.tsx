import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!nombre || !telefono || !email || !password || !password2) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (password !== password2) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.100.10:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo: email,
          contraseña: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Error en el registro');
        setLoading(false);
        return;
      }

      Alert.alert('Éxito', data.message || 'Registro completado');
      setLoading(false);
      router.push('/'); // Navegar tras registro exitoso
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingVertical: 40, width: '100%', alignItems: 'center' }}
      >
        <Image
          source={require('../assets/images/jardin-header.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>📝 Crear cuenta</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            placeholder="Número de teléfono"
            placeholderTextColor="#999"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            editable={!loading}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            placeholder="Verificar contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && { backgroundColor: '#a5d6a7' }]}
          onPress={onRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2f1',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 24,
  },
  inputContainer: {
    width: '90%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  registerButton: {
    backgroundColor: '#43a047',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 12,
    width: '90%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    color: '#1b5e20',
    fontSize: 14,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});