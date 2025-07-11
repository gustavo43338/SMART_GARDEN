import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Monitor from './monitor';
import EstadoPlantas from './EstadoPlantas';
import HistorialPlantas from './HistorialPlantas';
import AgregarPlanta from './AgregarPlanta'; // Asegúrate de importar AgregarPlanta

export type RootStackParamList = {
  Monitor: undefined;
  EstadoPlantas: undefined;
  HistorialPlantas: undefined;
  AgregarPlanta: undefined; // Agrega esta línea
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Monitor">
        <Stack.Screen name="Monitor" component={Monitor} />
        <Stack.Screen name="EstadoPlantas" component={EstadoPlantas} />
        <Stack.Screen name="HistorialPlantas" component={HistorialPlantas} />
        <Stack.Screen name="AgregarPlanta" component={AgregarPlanta} /> {/* Registra la nueva pantalla */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
