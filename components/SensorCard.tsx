import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  titulo: string;
  valor: string;
}

export default function SensorCard({ titulo, valor }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>
      <Text style={styles.value}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 18,
    color: '#424242',
  },
});