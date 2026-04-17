import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import bcrypt from 'bcryptjs';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeAlumno: { nombre: string; rol: string; total_horas: number; nombre_proyecto: string };
  HorarioProfesor: { nombre: string; rol: string; total_horas: number };
  HomeAdmin: { nombre: string; rol: string; total_horas: number };
  InscribirAlumno: { nombre: string };
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

// Componente personalizado para mostrar errores
const ErrorModal = ({ visible, onClose, message }: { visible: boolean; onClose: () => void; message: string }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.errorBox}>
          <Image
            source={require('./logo.png')} // Ajusta la ruta de la imagen de error
            style={styles.errorImage}
          />
          <Text style={styles.errorText}>{message}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Por favor, ingrese su correo y contraseña.');
      setErrorVisible(true);
      return;
    }

    try {
      const response = await fetch('http://192.242.2.62:8080/api/usuarios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const usuarios = await response.json();

      if (response.ok) {
        const usuario = usuarios.find((user: any) => user.correo === email);

        if (usuario) {
          const { nombre, rol, id, contrasena: storedHashedPassword } = usuario;

          // Comparar la contraseña ingresada con la almacenada (hash)
          const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);

          if (isPasswordValid) {
            // Mostrar el nombre del usuario en un alert
            Alert.alert('Bienvenido', `Bienvenido ${nombre}`);

            // Navegación dependiendo del rol del usuario
            switch (rol) {
              case 'docente':
                navigation.navigate('HomeDocente', { nombre, rol, total_horas: 0, nombre_proyecto: '' });
                break;
              case 'docente administrador horas sociales':
                  navigation.navigate('HomeDocenteAdmin', { nombre, rol, total_horas: 0, nombre_proyecto: '' });
                  break;
              case 'estudiante':
                // Verificar si el estudiante está inscrito en algún proyecto
                const responseInscripcion = await fetch('http://192.242.2.62:8080/api/inscripcion_proyectos');
                const inscripciones = await responseInscripcion.json();
                const inscripcion = inscripciones.find((item: any) => item.idEstudiante === id);

                if (inscripcion) {
                  // Obtener detalles del proyecto
                  const responseProyectos = await fetch('http://192.242.2.62:8080/api/proyectos');
                  const proyectos = await responseProyectos.json();
                  const proyecto = proyectos.find((proj: any) => proj.idProyecto === inscripcion.idProyecto);

                  // Redirigir a HomeAlumno si está inscrito en un proyecto
                  navigation.navigate('HomeAlumno', {
                    nombre,
                    rol,
                    total_horas: 0,
                    nombre_proyecto: proyecto.nombreProyecto,
                  });
                } else {
                  // Redirigir a InscribirAlumno si no está inscrito en ningún proyecto
                  navigation.navigate('InscribirAlumno', { nombre });
                }
                break;
              case 'coordinador':
              case 'administrador':
                navigation.navigate('HomeAdmin', { nombre, rol, total_horas: 0 });
                break;
              default:
                setErrorMessage('Rol no reconocido.');
                setErrorVisible(true);
            }
          } else {
            setErrorMessage('Contraseña incorrecta.');
            setErrorVisible(true);
          }
        } else {
          setErrorMessage('El usuario no existe.');
          setErrorVisible(true);
        }
      } else {
        setErrorMessage('Error al obtener los usuarios de la API.');
        setErrorVisible(true);
      }
    } catch (error) {
      setErrorMessage('Error de red al intentar conectarse a la API.');
      setErrorVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.redBackground}>
        <Image
          source={require('./login.png')} // Ajusta la ruta según donde esté la imagen
          style={styles.image}
        />
      </View>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>GESCOH</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su email"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
      <ErrorModal visible={errorVisible} onClose={() => setErrorVisible(false)} message={errorMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8001F', // Rojo
  },
  redBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1.9,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 43,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  image: {
    width: 240,
    height: 150,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 35,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#B8001F',
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
    height: 50,
    textAlign: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorBox: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  errorImage: {
    width: 260,
    height: 150,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#B8001F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
