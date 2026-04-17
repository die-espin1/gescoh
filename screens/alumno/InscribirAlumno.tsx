import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InscribirAlumno = () => {
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [estudianteId] = useState(1); // Asignar ID del estudiante aquí
  const [horasRealizadas, setHorasRealizadas] = useState(0); // Número de horas realizadas
  const [fechaInscripcion] = useState(new Date().toISOString().split('T')[0]); // Fecha de inscripción actual
  const [fechaCreacion] = useState(new Date().toISOString().split('T')[0]); // Fecha de creación
  const [estado] = useState('solicitado'); // Estado inicial

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response = await fetch('http://192.242.2.62:8080/api/proyectos');
        const data = await response.json();
        setProyectos(data);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener la lista de proyectos.');
      }
    };

    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://192.242.2.62:8080/api/usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener la lista de usuarios.');
      }
    };

    fetchProyectos();
    fetchUsuarios();
  }, []);

  const handleInscribir = async (idProyecto) => {
    try {
        const response = await fetch('http://192.242.2.62:8080/api/inscripcion_proyectos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idEstudiante: estudianteId,        // Asegúrate de que este ID sea correcto
                idProyecto: idProyecto,             // ID del proyecto actual
                horasRealizadas: horasRealizadas,   // Horas realizadas (puede ser 0 por ahora)
                fechaInscripcion: fechaInscripcion, // Fecha de inscripción actual
                fechaCreacion: fechaCreacion,       // Fecha de creación actual
                estado: estado                      // Estado inicial
            }),
        });
        
        if (response.ok) {
            Alert.alert('Éxito', 'Estudiante inscrito en el proyecto.');
        } else {
            const errorResponse = await response.text(); // Leer la respuesta de error
            Alert.alert('Error', errorResponse); // Mostrar el mensaje de error
        }
    } catch (error) {
        Alert.alert('Error', 'Error de red al inscribir al estudiante.');
    }
};


  const nextProject = () => {
    if (currentIndex < proyectos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevProject = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (proyectos.length === 0) {
    return <Text style={styles.loadingText}>Cargando proyectos...</Text>;
  }

  const currentProject = proyectos[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={prevProject} disabled={currentIndex === 0}>
          <Ionicons name="arrow-back" size={30} color={currentIndex === 0 ? '#ccc' : '#fff'} />
        </TouchableOpacity>

        <View style={styles.card}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder image, replace with actual project image if available
            style={styles.image}
          />
          <Text style={styles.projectTitle}>{currentProject.nombreProyecto}</Text>
          <Text style={styles.projectDescription}>{currentProject.descripcion}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleInscribir(currentProject.idProyecto)}>
            <Text style={styles.buttonText}>Inscribir</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={nextProject} disabled={currentIndex === proyectos.length - 1}>
          <Ionicons name="arrow-forward" size={30} color={currentIndex === proyectos.length - 1 ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8001F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '75%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  projectDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#B8001F',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default InscribirAlumno;
