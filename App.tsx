import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import AgregarHoraSocial from './screens/docente/AgregarHoraSocial';
//import HorarioProfesor from './screens/docente/HorarioProfesor';
import HistorialHorasSociales from './screens/docente/HistorialHorasSociales';
import HorasSociales from './screens/alumno/HorasSociales';
import HomeAlumno from './screens/alumno/HomeAlumno';
import AsignacionSalon from './screens/docente/AsignacionSalon';
import AsignacionSalonAdmin from './screens/docente/AsignacionSalonAdmin';
import HomeDocente from './screens/docente/HomeDocente';
import HistorialAsignacionSalon from './screens/admin/HistorialAsignacionSalon';
import HomeAdmin from './screens/admin/HomeAdmin';
import HistorialHorasSocialesAdmin from './screens/admin/HistorialHorasSocialesAdmin';
import InscribirAlumno from './screens/alumno/InscribirAlumno';
import Horario from './screens/docente/Horario';
import HorarioAdmin from './screens/docente/HorarioAdmin';
import HorariosGeneral from './screens/admin/HorariosGeneral';
import HomeDocenteAdmin from './screens/docente/HomeDocenteAdmin';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  HorasSociales: undefined; // Asegúrate de que el nombre coincide con el que usas en el navigate
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AgregarHoraSocial" component={AgregarHoraSocial} />
        <Stack.Screen name="HorasSociales" component={HorasSociales} />
        <Stack.Screen name="HistorialHorasSociales" component={HistorialHorasSociales} />
        <Stack.Screen name="HistorialHorasSocialesAdmin" component={HistorialHorasSocialesAdmin} />
        <Stack.Screen name="AsignacionSalon" component={AsignacionSalon} />
        <Stack.Screen name="AsignacionSalonAdmin" component={AsignacionSalonAdmin} />
        <Stack.Screen name="HomeDocente" component={HomeDocente} />
        <Stack.Screen name="HomeDocenteAdmin" component={HomeDocenteAdmin} />
        <Stack.Screen name="HomeAlumno" component={HomeAlumno} />
        <Stack.Screen name="HomeAdmin" component={HomeAdmin} />
        <Stack.Screen name="HorarioAdmin" component={HorarioAdmin} />
        <Stack.Screen name="Horario" component={Horario} />
        <Stack.Screen name="HorariosGeneral" component={HorariosGeneral} />
        <Stack.Screen name="InscribirAlumno" component={InscribirAlumno} />
        <Stack.Screen name="HistorialAsignacionSalon" component={HistorialAsignacionSalon} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
