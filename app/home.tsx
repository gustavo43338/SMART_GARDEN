import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useRef } from 'react';

export default function HomeScreen() {
  const router = useRouter();

  // Animaciones para botones
  const scaleAnimMonitor = useRef(new Animated.Value(1)).current;
  const scaleAnimSettings = useRef(new Animated.Value(1)).current;

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>Bienvenido al Jardín Inteligente</Text>
        <Text style={styles.subtitle}>
          Controla y monitorea tu jardín de manera fácil y eficiente
        </Text>

        {/* Botón Monitorear */}
        <Animated.View style={{ transform: [{ scale: scaleAnimMonitor }] }}>
          <Pressable
            onPress={() => router.push('/monitor')}
            onPressIn={() => animatePressIn(scaleAnimMonitor)}
            onPressOut={() => animatePressOut(scaleAnimMonitor)}
            style={({ pressed }) => [
              styles.button,
              styles.monitorButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Monitorear Jardín</Text>
          </Pressable>
        </Animated.View>

        {/* Botón Configuración */}
        <Animated.View style={{ transform: [{ scale: scaleAnimSettings }] }}>
          <Pressable
            onPress={() => router.push('/Configuracion')}
            onPressIn={() => animatePressIn(scaleAnimSettings)}
            onPressOut={() => animatePressOut(scaleAnimSettings)}
            style={({ pressed }) => [
              styles.button,
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Configuración</Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footer}>🌱 Desarrollado con 💚 por SMART GARDEN</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#d0ecec',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
    textShadowColor: '#1b5e20',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1b5e20',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  button: {
    width: 280,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  monitorButton: {
    backgroundColor: '#43a047',
    shadowColor: '#2e7d32',
  },
  settingsButton: {
    backgroundColor: '#81c784',
    shadowColor: '#4caf50',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e0f2f1',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    color: '#4a4a4a',
    textAlign: 'center',
    width: '100%',
    fontWeight: '500',
  },
});
