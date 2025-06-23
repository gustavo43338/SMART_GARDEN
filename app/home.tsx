import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Bienvenido al Jardín Inteligente</Text>

      <TouchableOpacity
        style={styles.monitorButton}
        onPress={() => router.push('/monitor')}
      >
        <Text style={styles.monitorButtonText}>Monitorear Jardín</Text>
      </TouchableOpacity>

      {}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 40,
    textAlign: 'center',
  },
  monitorButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
  },
  monitorButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});