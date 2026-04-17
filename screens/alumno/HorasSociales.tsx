import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type HorasSocialesProps = {
  route: {
    params: {
      nombre: string;
    };
  };
};

type HorasSocialesData = {
  totalHoras: number;
  fechaGeneracion: string;
  descripcion: string;
};

export default function HorasSociales({ route }: HorasSocialesProps) {
  const { nombre } = route.params;
  const [horasSociales, setHorasSociales] = useState<HorasSocialesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-300)).current;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchHorasSociales = async () => {
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

        const horasOrdenadas = horasDelEstudiante.sort((a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime());

        setHorasSociales(horasOrdenadas);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchHorasSociales();
  }, [nombre]);

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
      {/* Botón del menú hamburguesa */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        
      <Ionicons name={menuVisible ? 'close' : 'menu'} size={32} color={menuVisible ? 'black' : 'white'} />
      </TouchableOpacity>

      {/* Menú animado */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeAlumno', { nombre })}>
          <Text style={styles.menuItem}>Panel Principal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.menuItem}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Header con imagen y título */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial de{"\n"}Horas Sociales</Text>
          <Image source={require('./a.png')} style={styles.image} />
        </View>
      </View>

      {/* Contenido principal */}
      {horasSociales.length === 0 ? (
        <View style={styles.noReportesMessageContainer}>
          <Text style={styles.noReportesMessage}>No se encontraron horas sociales para este usuario.</Text>
        </View>
      ) : (
        <FlatList
          data={horasSociales}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.itemContainer, { borderColor: '#FF6B6B', borderWidth: 2 }]}>
              <View style={styles.itemRow}>
                <View style={styles.leftSection}>
                  <Text style={styles.hoursText}>{item.totalHoras} H</Text>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.itemText}>
                    <Text style={styles.bold}>Fecha:</Text> {item.fechaGeneracion}
                  </Text>
                  <Text style={styles.itemText}>
                    <Text style={styles.bold}>Descripción:</Text> {item.descripcion}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    textAlign: 'center',
  },
  image: {
    width: 190,
    height: 140,
    marginTop: 10,
    marginBottom: 20,
  },
  noReportesMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noReportesMessage: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 2,
  },
  itemText: {
    fontSize: 16,
  },
  hoursText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
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
});
