import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Image,
  FlatList,
  ScrollView, // Importa ScrollView
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HorarioGeneral = ({ navigation }) => {
  const route = useRoute();
  const { nombre } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [clases, setClases] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const menuAnimation = useState(new Animated.Value(-300))[0];
  const [idDocente, setIdDocente] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOptions, setShowOptions] = useState(false); // Estado para mostrar las opciones del ComboBox

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (selectedUsuario) {
      setIdDocente(selectedUsuario.id);
      fetchClases(selectedUsuario.id);
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

  const fetchClases = async (idDocente) => {
    try {
      const response = await fetch('http://192.242.2.62:8080/api/horarios');
      const data = await response.json();
      const clasesDocente = data.filter((clase) => clase.idDocente === idDocente);

      if (clasesDocente.length > 0) {
        setClases(clasesDocente);
      } else {
        Alert.alert('Sin Clases', 'No se encontraron clases para este docente.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al obtener las clases.');
    }
  };

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

  const currentDateString = currentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentDayOfWeek = currentDate.getDay();

  const clasesDelDia = clases.filter((clase) => {
    const diasSemana = {
      domingo: 0,
      lunes: 1,
      martes: 2,
      miércoles: 3,
      jueves: 4,
      viernes: 5,
      sábado: 6,
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
    navigation.navigate('Login');
  };

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
        <Text style={styles.headerText}>Horario</Text>
        <Image source={require('./soc.png')} style={styles.image} />
      </View>

      <View style={styles.dayContainer}>
        <TouchableOpacity onPress={handlePreviousDay}>
          <Ionicons name="chevron-back-outline" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.dayTitle}>{currentDateString}</Text>
        <TouchableOpacity onPress={handleNextDay}>
          <Ionicons name="chevron-forward-outline" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ComboBox para seleccionar un usuario */}
      <View style={styles.comboBoxContainer}>
        <TouchableOpacity style={styles.comboBox} onPress={toggleOptions}>
          <Text style={selectedUsuario ? selectedUsuario.nombre : 'Seleccionar'} style={styles.comboBoxText} />
        </TouchableOpacity>
        {showOptions && (
          <ScrollView style={styles.optionsContainer} nestedScrollEnabled={true}>
            {usuarios.map((usuario) => (
              <TouchableOpacity key={usuario.id} onPress={() => handleSelectUsuario(usuario)}>
                <Text style={styles.optionText}>{usuario.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={clasesDelDia}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.idSalon}_${item.horaInicio}`}
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
  image: {
    width: 220,
    height: 170,
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
    color: '#6200EE',
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
    width:85
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

export default HorarioGeneral;
