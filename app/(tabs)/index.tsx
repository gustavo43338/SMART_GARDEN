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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface BubbleProps {
  id: number;
  size: number;
  left: number;
  duration: number;
}

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [bubbles, setBubbles] = useState<BubbleProps[]>([]);
  const animations = useRef<Animated.Value[]>([]).current;

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
      const response = await fetch('http://192.168.100.10:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        router.replace('/home');
      } else {
        setError(data.error || 'Credenciales incorrectas.');
      }
    } catch {
      setError('Error de conexión. Intenta más tarde.');
    } finally {
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
    newBubbles.forEach(() => {
      animations.push(new Animated.Value(height + 100));
    });
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

      <View style={styles.loginContainer}>
        <Image
          source={require('C:/Users/gusta/smart-garden/smart-garden/assets/images/jardin-header.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Iniciar Sesión</Text>
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#006241"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
          editable={!loading}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#006241"
          style={styles.input}
          secureTextEntry
          value={contraseña}
          onChangeText={setContraseña}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

       
        <TouchableOpacity onPress={() => router.push('/Recuperar')}>
  <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
</TouchableOpacity>


        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
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
  loginContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 36,
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
    width: 130,
    height: 130,
    marginBottom: 28,
    borderRadius: 65,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#006241',
    marginBottom: 32,
  },
  errorText: {
    color: '#cc0000',
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#006241',
    borderRadius: 16,
    backgroundColor: '#e5f3eb',
    fontSize: 17,
    color: '#003300',
  },
  button: {
    width: '100%',
    padding: 18,
    backgroundColor: '#006241',
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#e5f3eb',
    fontSize: 18,
    fontWeight: '700',
  },
  forgotLink: {
    marginTop: 12,
    color: '#006241',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  registerLink: {
    marginTop: 18,
    color: '#006241',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
});
