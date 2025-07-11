import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AgregarPlanta = () => {
    const [nombre, setNombre] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [humedadTierra, setHumedadTierra] = useState(''); // Humedad de la tierra
    const [aire, setAire] = useState(''); // Aire como valor numérico
    const [luminosidad, setLuminosidad] = useState(''); // Luminosidad como valor numérico
    const [frecuenciaRiego, setFrecuenciaRiego] = useState('');
    const navigation = useNavigation();

    const handleAgregarPlanta = async () => {
        if (!nombre || !temperatura || !humedadTierra || !aire || !luminosidad || !frecuenciaRiego) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        const plantaData = {
            nombre,
            temperatura: parseFloat(temperatura),
            humedadTierra: parseFloat(humedadTierra), // Humedad de la tierra
            aire: parseFloat(aire), // Aire como valor numérico
            luminosidad: parseFloat(luminosidad), // Luminosidad como valor numérico
            frecuenciaRiego,
        };

        try {
            const response = await fetch('http://192.168.100.10:3000/plantas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(plantaData),
            });

            if (!response.ok) throw new Error('Error al agregar planta');

            Alert.alert('Éxito', 'Planta agregada correctamente');
            navigation.goBack();
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Error', 'Ocurrió un error desconocido');
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
            />
            <TextInput
                style={styles.input}
                placeholder="Temperatura (°C)"
                value={temperatura}
                onChangeText={setTemperatura}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Humedad de la Tierra (%)"
                value={humedadTierra}
                onChangeText={setHumedadTierra}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Aire (valor numérico)"
                value={aire}
                onChangeText={setAire}
                keyboardType="numeric" // Campo numérico
            />
            <TextInput
                style={styles.input}
                placeholder="Luminosidad (valor numérico)"
                value={luminosidad}
                onChangeText={setLuminosidad}
                keyboardType="numeric" // Campo numérico
            />
            <TextInput
                style={styles.input}
                placeholder="Frecuencia de Riego"
                value={frecuenciaRiego}
                onChangeText={setFrecuenciaRiego}
            />
            <Button title="Agregar Planta" onPress={handleAgregarPlanta} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
});

export default AgregarPlanta;
