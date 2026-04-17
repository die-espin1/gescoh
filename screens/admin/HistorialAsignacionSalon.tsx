import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
  FlatList, Image
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HistorialAsignacionSalon = ({ navigation }) => {
  const route = useRoute();
  const { nombre } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const menuAnimation = useState(new Animated.Value(-300))[0];
  const [showOptions, setShowOptions] = useState(false); // Estado para mostrar las opciones del ComboBox

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (selectedUsuario) {
      fetchAsignaciones(selectedUsuario.id);
    }
  }, [selectedUsuario]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/usuarios');
      const data = await response.json();
      const usuariosFiltrados = data.filter((user) =>
        ['docente'].includes(user.rol.toLowerCase())
      );
      setUsuarios(usuariosFiltrados);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener los usuarios.');
      setLoading(false);
    }
  };

  const fetchAsignaciones = async (idDocente) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/reportes_asignacion_salones');
      const data = await response.json();
      const asignacionesDocente = data.filter((asignacion) => asignacion.idDocente === idDocente);

      if (asignacionesDocente.length > 0) {
        setAsignaciones(asignacionesDocente);
      } else {
        Alert.alert('Sin Asignaciones', 'No se encontraron asignaciones para este docente.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener las asignaciones.');
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
    navigation.navigate('Login');
  };

  const renderAsignacionItem = ({ item }) => (
    <View style={styles.classContainer}>
      
    <View style={styles.salonContainer}>
      <Text style={styles.salonText}>{item.totalHorasCubiertas} H</Text>
    </View>
    <View style={styles.classInfo}></View>
      <Text style={styles.asignacionText}>
         Fecha: {item.fechaGeneracion}
      </Text>
    </View>
  );

  const handleSelectUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setShowOptions(false); // Ocultar las opciones después de seleccionar
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
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
        <TouchableOpacity onPress={() => navigation.navigate('AgregarHoraSocial', { nombre })}>
          <Text style={styles.menuItem}>Agregar Hora Social</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HistorialHorasSociales', { nombre })}>
          <Text style={styles.menuItem}>Historial de horas sociales</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AsignacionSalon', { nombre })}>
          <Text style={styles.menuItem}>Historial de asignación de salón</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.header}>
        <Text style={styles.headerText}>Asignaciones de Salón</Text>
        <Image source={require('./sall.png')} style={styles.image} />
      </View>

      {/* ComboBox para seleccionar un docente */}
      <View style={styles.comboBoxContainer}>
        <TouchableOpacity style={styles.comboBox} onPress={toggleOptions}>
          <Text style={[styles.comboBoxText, { color: selectedUsuario ? 'black' : '#000' }]}>
            {selectedUsuario ? selectedUsuario.nombre : 'Seleccionar Docente'}
          </Text>
        </TouchableOpacity>
        {showOptions && (
          <ScrollView style={styles.optionsContainer}>
            {usuarios.map((usuario) => (
              <TouchableOpacity key={usuario.id} onPress={() => handleSelectUsuario(usuario)}>
                <Text style={styles.optionText}>{usuario.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={asignaciones}
        renderItem={renderAsignacionItem}
        keyExtractor={(item) => `${item.idDocente}_${item.fechaGeneracion}`}
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
    height: 325,
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
  image: {
    width: 185,
    height: 185,
    marginTop: 10,
    marginBottom: 20,
  },
  comboBoxContainer: {
    margin: 15,
    borderWidth: 1,
    borderColor: 'black', // Borde rojo para el ComboBox
    borderRadius: 50,
    backgroundColor: 'white',
    position: 'relative',
    color: 'black'
  },
  comboBox: {
    padding: 15,
  },
  comboBoxText: {
    color: '#000', // Color del texto del ComboBox
    fontSize: 16,
  },
  optionsContainer: {
    maxHeight: 150, // Limita la altura máxima del contenedor de opciones
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#B8001F',
    borderRadius: 8,
    zIndex: 100,
  },
  optionText: {
    padding: 10,
    color: 'black',
    fontSize: 16,
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#EA5455',
    color: 'white',
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    width:80
  },
  salonText: {
    color: '#fff',
    fontSize: 16,
  },
  classInfo: {
    marginTop: 5,
  },
  classText: {
    fontSize: 14,
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
    color: '#EA5455',
  },
  flatList: {
    marginBottom: 20,
    width: '85%', // Cambia este valor según tus necesidades
    alignSelf: 'center', // Esto centra el FlatList horizontalmente
    color: '#000', // Cambiar el color del texto a negro
    
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default HistorialAsignacionSalon;
