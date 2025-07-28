import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AgregarPlanta = () => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [humedad, setHumedad] = useState('');
    const [luminosidad, setLuminosidad] = useState('');
    const [calidadAire, setCalidadAire] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const navigation = useNavigation();

    const handleAgregarPlanta = async () => {
        if (!nombre || !tipo || !humedad || !luminosidad || !calidadAire || !temperatura) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        const plantaData = {
            nombre,
            tipo,
            humedad: parseFloat(humedad),
            luminosidad: parseFloat(luminosidad),  
            calidadAire,
            temperatura: parseFloat(temperatura),
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
            // Limpiar campos
            setNombre('');
            setTipo('');
            setHumedad('');
            setLuminosidad('');
            setCalidadAire('');
            setTemperatura('');
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
            <Text style={styles.header}>Agregar Nueva Planta</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre Común y Científico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Lavanda (Lavandula)"
                    value={nombre}
                    onChangeText={setNombre}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Tipo de Planta</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Suculenta, Hierba, Arbusto"
                    value={tipo}
                    onChangeText={setTipo}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Humedad (%)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 45"
                    value={humedad}
                    onChangeText={setHumedad}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Luminosidad (lux)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 500"
                    value={luminosidad}
                    onChangeText={setLuminosidad}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Calidad del Aire (CO₂, PM2.5)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: CO₂: 400ppm, PM2.5: 35µg/m³"
                    value={calidadAire}
                    onChangeText={setCalidadAire}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Temperatura (°C)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 22.5"
                    value={temperatura}
                    onChangeText={setTemperatura}
                    keyboardType="numeric"
                />
            </View>

            <Button title="Agregar Planta" onPress={handleAgregarPlanta} color="#4CAF50" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#e8f5e9',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#2e7d32',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#2e7d32',
    },
    input: {
        height: 50,
        borderColor: '#81c784',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
});

export default AgregarPlanta;
