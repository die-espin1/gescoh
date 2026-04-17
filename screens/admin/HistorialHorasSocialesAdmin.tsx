import React, { useState, useRef } from 'react'; 
import { View, Text, StyleSheet, FlatList, Alert, TextInput, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HistorialHorasSocialesAdmin = () => {
  const [nombre, setNombre] = useState(''); // Estado para el nombre del estudiante ingresado
  const [historial, setHistorial] = useState([]); // Estado para el historial de horas sociales
  const [idEstudiante, setIdEstudiante] = useState(null); // Estado para el ID del estudiante
  const [menuVisible, setMenuVisible] = useState(false); // Estado para la visibilidad del menú
  const menuAnimation = useRef(new Animated.Value(-300)).current; // Posición inicial del menú fuera de la pantalla

  const navigation = useNavigation(); // Para la navegación dentro del menú

  // Función para alternar la visibilidad del menú
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    navigation.navigate('Login'); // Redirige a LoginScreen
  };

  // Función para obtener el ID del estudiante a partir de su nombre
  const fetchEstudianteId = async () => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/usuarios');
      const data = await response.json();

      // Buscamos el estudiante por nombre
      const estudiante = data.find((user) => user.nombre.toLowerCase() === nombre.toLowerCase());

      if (estudiante) {
        setIdEstudiante(estudiante.id); // Guardamos el ID del estudiante
        fetchHistorialHorasSociales(estudiante.id); // Llamamos a la función para obtener el historial
      } else {
        Alert.alert('Error', 'Estudiante no encontrado en el sistema.');
        setHistorial([]); // Limpiamos el historial en caso de error
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener la información del estudiante.');
    }
  };

  // Función para obtener el historial de horas sociales basado en el ID del estudiante
  const fetchHistorialHorasSociales = async (idEstudiante) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/reportes_horas_sociales');
      const data = await response.json();

      // Filtrar los reportes para obtener solo los del estudiante actual
      const reportesEstudiante = data.filter((reporte) => reporte.idEstudiante === idEstudiante);

      if (reportesEstudiante.length > 0) {
        setHistorial(reportesEstudiante); // Guardamos el historial en el estado
      } else {
        Alert.alert('Sin Datos', 'No se encontró historial de horas sociales para este estudiante.');
        setHistorial([]); // Limpiamos el historial si no se encontraron datos
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener el historial de horas sociales.');
    }
  };

  // Renderizado de cada ítem en la lista de historial
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.circleContainer}>
        <Text style={styles.totalHoras}>{item.totalHoras}H</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.textoItem}>Estudiante: {nombre}</Text>
        <Text style={styles.textoItem}>Descripción: {item.descripcion}</Text>
        <Text style={styles.fechaItem}>Fecha: {item.fechaGeneracion}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón del menú hamburguesa */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name={menuVisible ? 'close' : 'menu'} size={32} color={menuVisible ? 'black' : 'white'} />
      </TouchableOpacity>

      {/* Menú animado */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <TouchableOpacity onPress={() => navigation.navigate('HistorialAsignacionSalon', { nombre })}>
          <Text style={styles.menuItem}>Historial de asignación a salón</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HorariosGeneral', { nombre })}>
          <Text style={styles.menuItem}>Horarios general</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Historial de Horas Sociales</Text>
        <Image
          source={require('./soc.png')} // Ajusta la ruta según donde esté la imagen
          style={styles.image}
        />
      </View>
      
      {/* Campo de entrada para el nombre */}
      <TextInput
        style={styles.input}
        placeholder="Ingrese el nombre del estudiante"
        value={nombre}
        onChangeText={setNombre} // Actualiza el estado con el texto ingresado
      />

      {/* Botón para enviar la solicitud */}
      <TouchableOpacity style={styles.button} onPress={fetchEstudianteId}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      {historial.length > 0 ? (
        <FlatList
          data={historial}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()} // Clave única para cada ítem
        />
      ) : (
        <Text style={styles.noDataText}>No se encontró historial de horas sociales.</Text>
      )}
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
    height: 320,
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
  input: {
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 35,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderColor: '#B8001F',
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: 'row', // Cambiado a 'row' para mostrar el círculo y detalles en fila
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  textoItem: {
    fontSize: 16,
    color: '#000',
  },
  fechaItem: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#B8001F',
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
    height: 50,
    marginHorizontal: 50,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#333',
    marginBottom: 20,
  },
  image: {
    width: 220,
    height: 170,
    marginTop: 10,
    marginBottom: 20,
  },
  circleContainer: {
    backgroundColor: '#EA5455',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  totalHoras: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HistorialHorasSocialesAdmin;
