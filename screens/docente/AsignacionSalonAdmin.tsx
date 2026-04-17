import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Animated, ActivityIndicator, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AsignacionSalonAdmin = ({ navigation }) => {
  const route = useRoute();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-300))[0]; // Animación del menú
  const { nombre } = route.params || {}; // Recibimos el nombre desde route.params
  const [idDocente, setIdDocente] = useState(null);

  useEffect(() => {
    if (nombre) {
      fetchDocenteId(nombre);
    } else {
      Alert.alert('Error', 'No se recibió el nombre del docente.');
      setLoading(false);
    }
  }, [nombre]);

  const fetchDocenteId = async (nombreDocente) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/usuarios');
      const data = await response.json();
      const docente = data.find((user) => user.nombre === nombreDocente);

      if (docente) {
        setIdDocente(docente.id);
        fetchAsignacionSalon(docente.id);
      } else {
        Alert.alert('Error', 'Docente no encontrado en el sistema.');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener el ID del docente.');
      setLoading(false);
    }
  };

  const fetchAsignacionSalon = async (idDocente) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/reportes_asignacion_salones');
      const data = await response.json();
      const reportesDocente = data.filter((reporte) => reporte.idDocente === idDocente);

      if (reportesDocente.length > 0) {
        setHistorial(reportesDocente);
      } else {
        Alert.alert('Sin Datos', 'No se encontró historial de asignación de salones para este docente.');
      }
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener el historial de asignación de salones.');
      setLoading(false);
    }
  };

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

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.circleContainer}>
        <Text style={styles.totalHoras}>{item.totalHorasCubiertas}H</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.textoItem}>Total de horas cubiertas: {item.totalHorasCubiertas}</Text>
        <Text style={styles.fechaItem}>Fecha de generación: {item.fechaGeneracion}</Text>
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
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}> 
        <Ionicons name={menuVisible ? 'close' : 'menu'} size={32} color={menuVisible ? 'black' : 'white'} />
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeDocenteAdmin', { nombre })}>
          <Text style={styles.menuItem}>Panel de docente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HistorialHorasSociales', { nombre })}>
          <Text style={styles.menuItem}>Historial de horas sociales</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AgregarHoraSocial', { nombre })}>
          <Text style={styles.menuItem}>Agregar hora social</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HorarioAdmin', { nombre })}>
          <Text style={styles.menuItem}>Horario</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.header}>
        <Text style={styles.headerText}>Historial de Asignación de Salones</Text>
        <Image
          source={require('./salon.png')} // Ajusta la ruta según donde esté la imagen
          style={styles.image}
        />
      </View>

      {historial.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No se encontraron reportes de asignación de salones para usted.</Text>
        </View>
      ) : (
        <FlatList
          data={historial}
          renderItem={renderItem}
          keyExtractor={(item) => item.fechaGeneracion + '_' + item.totalHorasCubiertas}
          style={styles.flatList}
        />
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
  itemContainer: {
    backgroundColor: '#fff',
    borderColor: '#B8001F',
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    alignItems: 'center',
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#000', // Cambia el color a negro
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20, // Añadido para un mejor espaciado
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 150,
    height: 150,
    marginTop: 10,
    marginBottom: 20,
  },
  flatList: {
    marginTop: 20,
  },
});

export default AsignacionSalonAdmin;
