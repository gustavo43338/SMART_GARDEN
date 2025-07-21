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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            placeholderTextColor="#6c6d6caa"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            editable={!loading}
            autoCapitalize="words"
            autoComplete="name"
          />
          <TextInput
            placeholder="Número de teléfono"
            placeholderTextColor="#6c6d6caa"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            style={styles.input}
            editable={!loading}
            autoComplete="tel"
          />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#6c6d6caa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            editable={!loading}
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#6c6d6caa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            editable={!loading}
            autoComplete="password-new"
          />
          <TextInput
            placeholder="Verificar contraseña"
            placeholderTextColor="#6c6d6caa"
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
            style={styles.input}
            editable={!loading}
            autoComplete="password-new"
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={onRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.7}>
          <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8e9',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 40,
    width: '90%',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2e7d32',
    marginBottom: 30,
    letterSpacing: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#a5d6a7',
    color: '#2e7d32',
  },
  registerButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  registerButtonText: {
    color: '#e8f5e9',
    fontSize: 18,
    fontWeight: '700',
  },
  loginLink: {
    color: '#2e7d32',
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
