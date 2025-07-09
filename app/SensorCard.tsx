// SensorCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type SensorCardProps = {
  titulo: string;
  valor: string | number;
};

export default function SensorCard({ titulo, valor }: SensorCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  valor: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
});
