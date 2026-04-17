import React, { useEffect, useState } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HomeDocente() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { nombre, rol } = route.params || {};

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-300));

  useEffect(() => {
    if (nombre && rol) {
      Alert.alert(`Bienvenido ${nombre}`, `Rol: ${rol}`);
    } else {
      Alert.alert('Error', 'Nombre o rol no disponibles.');
    }

    const fetchReportes = async () => {
      try {
        const usuariosResponse = await fetch('http://192.242.2.62:8080/api/usuarios');
        const usuariosData = await usuariosResponse.json();
        const docente = usuariosData.find(user => user.nombre === nombre);

        if (!docente) {
          Alert.alert('Error', 'No se encontró el docente');
          setLoading(false);
          return;
        }

        const reportesResponse = await fetch('http://192.242.2.62:8080/api/reportes_asignacion_salones');
        const reportesData = await reportesResponse.json();
        const reportesDocente = reportesData.filter(reporte => reporte.idDocente === docente.id);

        if (reportesDocente.length === 0) {
          Alert.alert('No se encontraron reportes de asignación de salones para este docente.');
        } else {
          setReportes(reportesDocente);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
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

  const getBorderColor = (index) => {
    const startColor = [251, 90, 91];
    const decreaseFactor = Math.floor((index / (reportes.length - 1)) * 255);
    const newColor = [
      startColor[0],
      Math.max(startColor[1] - decreaseFactor, 0),
      Math.max(startColor[2] - decreaseFactor, 0),
    ];
    return `rgb(${newColor[0]}, ${newColor[1]}, ${newColor[2]})`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  // Aquí se ajusta el estilo si no hay reportes
  const noReportes = reportes.length === 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name={menuVisible ? 'close' : 'menu'} size={32} color={menuVisible ? 'black' : 'white'} />
      </TouchableOpacity>

      {/* Menú animado */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <TouchableOpacity onPress={() => navigation.navigate('AsignacionSalon', { nombre })}>
          <Text style={styles.menuItem}>Historial de asignación de salón</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Horario', { nombre })}>
          <Text style={styles.menuItem}>Horario</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bienvenido {nombre}</Text>
          <Image
            source={require('./do.png')} // Ajusta la ruta según donde esté la imagen
            style={styles.image}
          />
        </View>
      </View>

      <Text style={styles.headerSubtitle}>Reportes de Asignación de Salones</Text>

      {noReportes ? (
        <View style={styles.noReportesMessageContainer}>
          <Text style={styles.noReportesMessage}>No se encontraron reportes de asignación de salones para usted.</Text>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.itemContainer, { borderColor: getBorderColor(index) }]}>
              <View style={styles.circleContainer}>
                <Text style={styles.totalHoras}>{item.totalHorasCubiertas}H</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.textoItem}>ID Docente: {item.idDocente}</Text>
                <Text style={styles.fechaItem}>Fecha: {item.fechaGeneracion}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Fondo blanco por defecto
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
    backgroundColor: '#B8001F', // Encabezado rojo
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
    color: 'white', // Texto en blanco
  },
  headerSubtitle: {
    fontSize: 20,
    color: 'black', // Texto en negro para el subtítulo
    marginTop: 10,
    fontWeight: 'bold', // Añade negrita
    textAlign: 'center', // Centrar el subtítulo
    padding: 20,
  },
  noReportesMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReportesMessage: {
    color: 'black', // Texto en negro
    fontSize: 20,
    textAlign: 'center',
  },
  image: {
    width: 210,
    height: 150,
    marginTop: 10,
    marginBottom: 20,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
