import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Animated, ActivityIndicator, Image, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HorarioAdmin = ({ navigation }) => {
  const route = useRoute();
  const { nombre } = route.params || {}; // Recibimos el nombre desde route.params
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [clases, setClases] = useState([]); // Estado para las clases
  const menuAnimation = useState(new Animated.Value(-300))[0]; // Animación del menú
  const [idDocente, setIdDocente] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Estado para controlar la fecha actual

  useEffect(() => {
    if (nombre) {
      Alert.alert(`Bienvenido ${nombre}`);
      fetchDocenteId(nombre); // Llama a la función para obtener el ID del docente
    } else {
      Alert.alert('Error', 'No se recibió el nombre del usuario.');
      setLoading(false);
    }
  }, [nombre]);

  // Función para obtener el ID del docente a partir del nombre
  const fetchDocenteId = async (nombreDocente) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/usuarios');
      const data = await response.json();
      const docente = data.find((user) => user.nombre === nombreDocente);

      if (docente) {
        setIdDocente(docente.id); // Guardamos el ID del docente
        fetchClases(docente.id); // Llamamos a la función para obtener las clases
      } else {
        Alert.alert('Error', 'Docente no encontrado en el sistema.');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener el ID del docente.');
      setLoading(false);
    }
  };

  // Función para obtener las clases del docente
  const fetchClases = async (idDocente) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/horarios');
      const data = await response.json();
      
      // Filtrar las clases para obtener solo las del docente actual
      const clasesDocente = data.filter((clase) => clase.idDocente === idDocente);

      if (clasesDocente.length > 0) {
        setClases(clasesDocente); // Guardamos las clases en el estado
      } else {
        Alert.alert('Sin Clases', 'No se encontraron clases para este docente.');
      }
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener las clases.');
      setLoading(false);
    }
  };

  // Función para cambiar de día
  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  // Formato para mostrar la fecha actual
  const currentDateString = currentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Función para obtener el día de la semana actual (0 = domingo, 1 = lunes, etc.)
  const currentDayOfWeek = currentDate.getDay();

  // Filtrar las clases para el día actual
  const clasesDelDia = clases.filter((clase) => {
    const diasSemana = {
      'domingo': 0,
      'lunes': 1,
      'martes': 2,
      'miércoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sábado': 6,
    };
    return diasSemana[clase.diaSemana.toLowerCase()] === currentDayOfWeek;
  });

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    navigation.navigate('Login'); // Redirige a LoginScreen.tsx
  };

  // Renderizado de cada clase en la lista
const renderItem = ({ item }) => (
  <View style={styles.classContainer}>
    <View style={styles.salonContainer}>
      <Text style={styles.salonText}>Salón {item.idSalon}</Text>
    </View>
    <View style={styles.classInfo}>
      <Text style={styles.classText}>
        {item.diaSemana}: {item.horaInicio.slice(0, 5)} - {item.horaFin.slice(0, 5)}
      </Text>
    </View>
  </View>
);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón de menú hamburguesa */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}> 
        <Ionicons name={menuVisible ? 'close' : 'menu'} size={32} color={menuVisible ? 'black' : 'white'} />
      </TouchableOpacity>

      {/* Menú animado */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeDocenteAdmin', { nombre })}>
          <Text style={styles.menuItem}>Panel de docente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AgregarHoraSocial', { nombre })}>
          <Text style={styles.menuItem}>Agregar Hora Social</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HistorialHorasSociales', { nombre })}>
          <Text style={styles.menuItem}>Historial de horas sociales</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AsignacionSalonAdmin', { nombre })}>
          <Text style={styles.menuItem}>Historial de asignación de salón</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Horario</Text>
        <Image
          source={require('./ho.png')} // Ajusta la ruta según donde esté la imagen
          style={styles.image}
        />
      </View>

      {/* Control del día */}
      <View style={styles.dayContainer}>
        <TouchableOpacity onPress={handlePreviousDay}>
          <Ionicons name="chevron-back-outline" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.dayTitle}>{currentDateString}</Text>
        <TouchableOpacity onPress={handleNextDay}>
          <Ionicons name="chevron-forward-outline" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Lista de clases filtradas por día */}
      <FlatList
        data={clasesDelDia}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.idSalon}_${item.horaInicio}`} // Clave única
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#B8001F',
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
    height: 330,
    margin: 0,
    paddingTop: 80,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 120,
    paddingHorizontal: 20,
    zIndex: 9,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    fontSize: 18,
    marginVertical: 20,
    color: 'black',
  },
  image: {
    width: 180,
    height: 187,
    marginTop: 10,
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  classContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#B8001F',
    borderWidth: 1,
    borderRadius: 10,
  },
  salonContainer: {
    backgroundColor: '#EA5455',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    width:85
  },
  salonText: {
    color: '#fff',
    fontSize: 16,
  },
  classInfo: {
    flex: 1,
  },
  classText: {
    fontSize: 16,
    color: '#000',
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HorarioAdmin;
