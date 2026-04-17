import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AgregarHoraSocial = ({ navigation, route }) => {
    const { nombre } = route.params; // Obtener el nombre pasado como parámetro
    const [estudiante, setEstudiante] = useState(null);
    const [horasSociales, setHorasSociales] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estudiantes, setEstudiantes] = useState([]);
    const [openEstudiante, setOpenEstudiante] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const menuAnimation = useState(new Animated.Value(-300))[0];

    useEffect(() => {
        const fetchEstudiantes = async () => {
            try {
                const response = await fetch('http://192.242.2.62:8080/api/usuarios');
                const data = await response.json();
                if (response.ok) {
                    const estudiantesFiltrados = data.filter(est => est.rol === 'estudiante');
                    setEstudiantes(estudiantesFiltrados);
                } else {
                    throw new Error(data.message || 'No se pudo obtener la lista de estudiantes');
                }
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        };

        fetchEstudiantes();
    }, []);

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

    const handleSave = async () => {
        const horas = parseInt(horasSociales, 10);
        if (isNaN(horas) || horas < 0) {
            Alert.alert('Error', 'Por favor, introduce un número entero no negativo para las horas sociales.');
            return;
        }

        if (!estudiante) {
            Alert.alert('Error', 'Por favor, selecciona un estudiante.');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            const response = await fetch('http://192.242.2.62:8080/api/reportes_horas_sociales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idEstudiante: estudiante,
                    totalHoras: horas,
                    descripcion,
                    fechaGeneracion: today,
                    fechaCreacion: today
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Éxito', 'El reporte se ha guardado correctamente.');
                setEstudiante(null);
                setHorasSociales('');
                setDescripcion('');
                setOpenEstudiante(false);
            } else {
                Alert.alert('Error', result.message || 'Error al agregar el reporte');
            }
        } catch (error) {
            Alert.alert('Error', 'Error de red');
        }
    };

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

            <View style={styles.header}>
                <Text style={styles.headerText}>Registro de Horas Sociales</Text>
                <Image
                    source={require('./al.png')} // Ajusta la ruta según donde esté la imagen
                    style={styles.image}
                />
            </View>
            <View style={styles.form}>
                <View style={[styles.formGroup, { zIndex: 1 }]}>
                    <Text style={styles.label}>Estudiante</Text>
                    <DropDownPicker
                        open={openEstudiante}
                        value={estudiante}
                        items={estudiantes.map((est) => ({ label: est.nombre, value: est.id }))}
                        setOpen={setOpenEstudiante}
                        setValue={setEstudiante}
                        style={styles.input}
                        placeholder="Selecciona un estudiante"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Cantidad de Horas Sociales</Text>
                    <TextInput
                        style={styles.input}
                        value={horasSociales}
                        onChangeText={text => setHorasSociales(text.replace(/[^0-9]/g, ''))}
                        placeholder="Ingrese horas sociales"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.input}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Ingrese una descripción (opcional)"
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#B8001F',
        padding: 0,
        alignItems: 'center',
        width: '100%',
        height: 320,
        paddingTop: 80,
    },
    headerText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
    form: {
        padding: 35,
    },
    formGroup: {
        marginBottom: 20,
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
    image: {
        width: 190,
        height: 160,
        marginTop: 10,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#B8001F',
        paddingVertical: 10,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: 10,
        height: 50,
        width: 350,
        textAlign: 'center',
    },
    saveButtonText: {
        color: '#fff',
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
});

export default AgregarHoraSocial;
