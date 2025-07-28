import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface BubbleProps {
  id: number;
  size: number;
  left: number;
  duration: number;
}

export default function Register() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [bubbles, setBubbles] = useState<BubbleProps[]>([]);
  const animations = useRef<Animated.Value[]>([]).current;

  const onRegister = async () => {
    setError('');
    if (!nombre || !telefono || !email || !password || !password2) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://apis-smartgarden.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombre,  // Cambiado a nombre_completo
          correo: email,
          contraseña: password,
          telefono: telefono,  // Añadido teléfono si lo necesitas en el backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en el registro.');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push('/');
    } catch (error) {
      setError('No se pudo conectar al servidor.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const bubbleCount = 12;
    const newBubbles: BubbleProps[] = [];
    for (let i = 0; i < bubbleCount; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * 40 + 15,
        left: Math.random() * (width - 50),
        duration: Math.random() * 6000 + 4000,
      });
    }
    setBubbles(newBubbles);
    animations.splice(0, animations.length);
    newBubbles.forEach(() => animations.push(new Animated.Value(height + 100)));
  }, []);

  useEffect(() => {
    if (bubbles.length === 0) return;

    bubbles.forEach((bubble, index) => {
      const animate = () => {
        animations[index].setValue(height + bubble.size);
        Animated.timing(animations[index], {
          toValue: -bubble.size,
          duration: bubble.duration,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => animate());
      };
      animate();
    });
  }, [bubbles]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fondo de burbujas */}
      <View style={styles.bubblesContainer}>
        {bubbles.map((bubble, i) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                width: bubble.size,
                height: bubble.size,
                left: bubble.left,
                borderRadius: bubble.size / 2,
                transform: [{ translateY: animations[i] || 0 }],
                opacity: 0.3 + Math.random() * 0.4,
              },
            ]}
          />
        ))}
      </View>

      {/* Contenedor del formulario */}
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <Image
          source={require('../assets/images/jardin-header.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Crear cuenta</Text>

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor="#006241"
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          editable={!loading}
        />
        <TextInput
          placeholder="Teléfono"
          placeholderTextColor="#006241"
          style={styles.input}
          value={telefono}
          keyboardType="phone-pad"
          onChangeText={setTelefono}
          editable={!loading}
        />
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#006241"
          style={styles.input}
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#006241"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TextInput
          placeholder="Repetir contraseña"
          placeholderTextColor="#006241"
          style={styles.input}
          secureTextEntry
          value={password2}
          onChangeText={setPassword2}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.registerLink}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003300',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  bubblesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    bottom: 0,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    padding: 30,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16,
    elevation: 24,
    width: '90%',
    maxWidth: 420,
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#006241',
    marginBottom: 16,
  },
  errorText: {
    color: '#cc0000',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#006241',
    borderRadius: 16,
    backgroundColor: '#e5f3eb',
    fontSize: 16,
    color: '#003300',
  },
  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#006241',
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#e5f3eb',
    fontSize: 17,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 18,
    color: '#006241',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
});