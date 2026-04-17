import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Animated, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeAlumno = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { nombre = 'Estudiante', rol = 'Usuario' } = route.params || {};

  const [horasSociales, setHorasSociales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHoras, setTotalHoras] = useState(0);
  const [nombreProyecto, setNombreProyecto] = useState('Sin proyecto asignado');
  const horasTotales = 150;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-300));

  useEffect(() => {
    Alert.alert(`Bienvenido ${nombre}`, `Rol: ${rol}`);

    const fetchData = async () => {
      try {
        const responseEstudiante = await fetch('http://192.242.2.62:8080/api/usuarios');
        const dataEstudiantes = await responseEstudiante.json();
        const estudiante = dataEstudiantes.find(user => user.nombre.toLowerCase() === nombre.toLowerCase());

        if (!estudiante) {
          Alert.alert('Error', 'Estudiante no encontrado');
          return;
        }

        const responseHoras = await fetch('http://192.242.2.62:8080/api/reportes_horas_sociales');
        const dataHoras = await responseHoras.json();
        const horasDelEstudiante = dataHoras.filter(item => item.idEstudiante === estudiante.id);
        setHorasSociales(horasDelEstudiante);

        const total = horasDelEstudiante.reduce((acc, item) => acc + item.totalHoras, 0);
        setTotalHoras(total);

        const responseInscripcion = await fetch('http://192.242.2.62:8080/api/inscripcion_proyectos');
        const dataInscripcion = await responseInscripcion.json();
        const proyectoInscrito = dataInscripcion.find(inscripcion => inscripcion.idEstudiante === estudiante.id);

        if (proyectoInscrito) {
          const responseProyectos = await fetch('http://192.242.2.62:8080/api/proyectos');
          const dataProyectos = await responseProyectos.json();
          const proyecto = dataProyectos.find(proj => proj.idProyecto === proyectoInscrito.idProyecto);
          setNombreProyecto(proyecto ? proyecto.nombreProyecto : 'Sin proyecto asignado');
        }

      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nombre, rol]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
  
      <Ionicons name={menuVisible ? 'close' : 'menu'} size={32} color={menuVisible ? 'black' : 'white'} />
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
      <TouchableOpacity onPress={() => navigation.navigate('HorasSociales', { nombre })}>
  <Text style={styles.menuItem}>Historial de Horas Sociales</Text>
</TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bienvenido {nombre}</Text>
          <Image source={require('./al.png')} style={styles.image} />
        </View>
      </View>

      <Text style={styles.headerSubtitle}>Horas Sociales</Text>

      {horasSociales.length === 0 ? (
        <View style={styles.noReportesMessageContainer}>
          <Text style={styles.noReportesMessage}>No se encontraron horas sociales para este usuario.</Text>
        </View>
      ) : (
        <View>
          {/* Aquí puedes renderizar la lista de horas sociales */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerContainer: {
    backgroundColor: '#B8001F',
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 20,
    color: 'black',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  noReportesMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReportesMessage: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
  },
  image: {
    width: 220,
    height: 185,
    marginTop: 10,
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeAlumno;
