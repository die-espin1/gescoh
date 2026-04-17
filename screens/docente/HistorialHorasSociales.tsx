import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, FlatList, Alert, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener react-native-vector-icons instalado.

const HistorialHorasSociales = ({ navigation }) => {
  const route = useRoute();
  const { nombre } = route.params; // Obtén el nombre del docente de los parámetros
  const [historial, setHistorial] = useState([]);
  const [nombreEstudiante, setNombreEstudiante] = useState(''); // Estado para el nombre del estudiante
  const [idDocente, setIdDocente] = useState(null); // Guardar el ID del docente logueado
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-300))[0]; // Posición inicial del menú fuera de pantalla.

  // Mostrar el nombre en un alert al ingresar al componente
  useEffect(() => {
    Alert.alert('Nombre del Docente', `Bienvenido ${nombre}`);
    fetchDocenteId(); // Llamamos a la función que busca el ID del docente
  }, [nombre]);

  // Función para obtener el ID del docente logueado
  const fetchDocenteId = async () => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/usuarios');
      const data = await response.json();
      const docente = data.find((user) => user.nombre === nombre);
      if (docente) {
        setIdDocente(docente.id);
      } else {
        Alert.alert('Error', 'Docente no encontrado en el sistema.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener el docente');
    }
  };

  // Función para obtener el historial de horas sociales
  const fetchHistorialHorasSociales = async () => {
    if (!nombreEstudiante.trim()) {
      Alert.alert('Error', 'Por favor, ingrese un nombre de estudiante válido');
      return;
    }

    try {
      // Limpiar el historial antes de realizar la búsqueda
      setHistorial([]);

      // 1. Verificar si el estudiante existe
      const usuariosResponse = await fetch('http://192.242.2.62:8080/api/usuarios');
      const usuariosData = await usuariosResponse.json();
      const estudiante = usuariosData.find((user) => user.nombre === nombreEstudiante);

      if (!estudiante) {
        Alert.alert('Error', 'Estudiante no encontrado.');
        return;
      }

      // 2. Verificar si el docente tiene un proyecto a su cargo
      const proyectosResponse = await fetch('http://192.242.2.62:8080/api/proyectos');
      const proyectosData = await proyectosResponse.json();
      const proyectoDocente = proyectosData.find((proyecto) => proyecto.idDocenteACargo === idDocente);

      if (!proyectoDocente) {
        Alert.alert('Error', 'El docente no tiene ningún proyecto a su cargo.');
        return;
      }

      // 3. Verificar si el estudiante está inscrito en el proyecto del docente
      const inscripcionesResponse = await fetch('http://192.242.2.62:8080/api/inscripcion_proyectos');
      const inscripcionesData = await inscripcionesResponse.json();
      const estudianteInscrito = inscripcionesData.find(
        (inscripcion) => inscripcion.idEstudiante === estudiante.id && inscripcion.idProyecto === proyectoDocente.idProyecto
      );

      if (!estudianteInscrito) {
        Alert.alert('Error', 'El estudiante no está inscrito en el proyecto del docente.');
        return;
      }

      // 4. Obtener el historial de horas sociales del estudiante
      const reportesResponse = await fetch('http://192.242.2.62:8080/api/reportes_horas_sociales');
      const reportesData = await reportesResponse.json();
      const historialEstudiante = reportesData.filter((reporte) => reporte.idEstudiante === estudiante.id);

      if (historialEstudiante.length > 0) {
        setHistorial(historialEstudiante);
      } else {
        Alert.alert('Error', 'No se encontraron horas sociales para el estudiante.');
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
        <Text style={styles.textoItem}>Estudiante: {nombreEstudiante}</Text>
        <Text style={styles.textoItem}>Descripción: {item.descripcion}</Text>
        <Text style={styles.fechaItem}>Fecha de generación: {item.fechaGeneracion}</Text>
      </View>
    </View>
  );

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -300 : 0, // Cambiar la posición según si el menú está visible o no
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    navigation.navigate('Login'); // Redirige a LoginScreen.tsx
  };

  return (
    <View style={styles.container}>
      {/* Botón del menú */}
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
                <TouchableOpacity onPress={() => navigation.navigate('AsignacionSalonAdmin', { nombre })}>
                    <Text style={styles.menuItem}>Historial de asignación de salón</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('HorarioAdmin', { nombre })}>
                    <Text style={styles.menuItem}>Horario</Text>
                </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Historial de Horas Sociales</Text>
        <Image
          source={require('./horas.png')} // Ajusta la ruta según donde esté la imagen
          style={styles.image}
        />
      </View>

      {/* Campo de entrada para el nombre del estudiante */}
      <TextInput
        style={styles.input}
        placeholder="Ingrese el nombre del estudiante"
        value={nombreEstudiante}
        onChangeText={setNombreEstudiante} // Actualiza el estado con el texto ingresado
      />

      <TouchableOpacity style={styles.button} onPress={fetchHistorialHorasSociales}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      {/* Renderizamos el historial o un mensaje si no hay datos */}
      {historial.length > 0 ? (
        <FlatList
          data={historial}
          renderItem={renderItem}
          keyExtractor={(item) => item.idEstudiante.toString() + '_' + item.fechaGeneracion} // Clave única
        />
      ) : (
        <Text style={styles.noDataText}>No se encontró historial de horas sociales.</Text>
      )}
    </View>
  );
};

// Estilos
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
    marginRight: 20,
    marginLeft: 20,
    marginTop: 20,
  },
  itemContainer: {
    backgroundColor: '#fff', // Fondo blanco
    borderColor: '#B8001F', // Borde color #B8001F
    borderWidth: 2, // Ancho del borde
    borderRadius: 10,
    flexDirection: 'row',
    padding: 10,
    marginTop:5,
    marginBottom: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  circleContainer: {
    backgroundColor: '#EA5455', // Color del círculo
    borderRadius: 50, // Para que sea un círculo
    width: 60, // Ancho del círculo
    height: 60, // Alto del círculo
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  totalHoras: {
    color: '#fff', // Texto blanco
    fontSize: 20, // Tamaño del texto
    fontWeight: 'bold', // Negrita
  },
  detailsContainer: {
    flex: 1,
  },
  textoItem: {
    fontSize: 16,
    color: '#000', // Cambia el color del texto para mejor contraste
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
    marginVertical: 20,
    color: 'black',
  },
  image: {
    width: 200,
    height: 160,
    marginTop: 10,
    marginBottom: 20,
  },
});

export default HistorialHorasSociales;
