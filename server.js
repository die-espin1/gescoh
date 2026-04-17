const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gescoh'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.post('/login', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Por favor, ingrese un correo electrónico');
    }

    const query = `
    SELECT 
        usuarios.nombre AS nombre_usuario, 
        usuarios.rol, 
        reportes_horas_sociales.total_horas,
        proyectos.nombre_proyecto,
        proyectos.descripcion,
        docente.nombre AS nombre_docente_encargado,  -- Obtener el nombre del docente
        GROUP_CONCAT(reportes_horas_sociales.fecha_generacion, ':', reportes_horas_sociales.total_horas) AS historial_horas
    FROM usuarios 
    LEFT JOIN reportes_horas_sociales ON usuarios.id_usuario = reportes_horas_sociales.id_estudiante
    LEFT JOIN inscripcion_proyectos ON usuarios.id_usuario = inscripcion_proyectos.id_estudiante
    LEFT JOIN proyectos ON inscripcion_proyectos.id_proyecto = proyectos.id_proyecto
    LEFT JOIN usuarios AS docente ON proyectos.id_docente_a_cargo = docente.id_usuario  -- Join para obtener el nombre del docente
    WHERE usuarios.correo = ?;`;

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor');
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        const user = results[0];
        const { nombre_usuario, rol, total_horas, nombre_proyecto, descripcion, nombre_docente_encargado, historial_horas } = user;

        if (historial_horas) {
            const horasSociales = historial_horas.split(',').map(entry => {
                const [fecha, horas] = entry.split(':');
                return { fecha_generacion: fecha, total_horas: horas };
            });

            res.status(200).send({
                message: 'Usuario encontrado', 
                nombre: nombre_usuario, 
                rol, 
                total_horas, 
                nombre_proyecto,
                descripcion_proyecto: descripcion,
                nombre_docente_encargado,  // Enviar el nombre del docente encargado
                horasSociales
            });
        } else {
            res.status(200).send({
                message: 'Usuario encontrado', 
                nombre: nombre_usuario, 
                rol, 
                total_horas, 
                nombre_proyecto,
                descripcion_proyecto: descripcion,
                nombre_docente_encargado,  // Enviar el nombre del docente encargado
                horasSociales: []
            });
        }
    });
});


app.post('/historial_horas_sociales', (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).send('Por favor, proporcione un nombre de usuario.');
    }

    const query = `
    SELECT 
        reportes_horas_sociales.total_horas,
        reportes_horas_sociales.fecha_generacion,
        usuarios.nombre AS nombre_estudiante
    FROM reportes_horas_sociales 
    JOIN usuarios ON reportes_horas_sociales.id_estudiante = usuarios.id_usuario
    WHERE usuarios.nombre = ?;`;

    db.query(query, [nombre], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor');
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'No se encontraron horas sociales para este usuario.' });
        }

        res.status(200).send({ horas_sociales: results });
    });
});

// Endpoint para agregar un reporte de horas sociales
app.post('/agregar_horas_sociales', (req, res) => {
    const { id_estudiante, total_horas, descripcion } = req.body;

    if (!id_estudiante || !total_horas) {
        return res.status(400).send('Faltan datos necesarios');
    }

    const fechaGeneracion = new Date(); 
    const query = `
        INSERT INTO reportes_horas_sociales (id_estudiante, total_horas, fecha_generacion, fecha_creacion, descripcion)
        VALUES (?, ?, ?, NOW(), ?)`;

    db.query(query, [id_estudiante, total_horas, fechaGeneracion, descripcion], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al agregar el reporte');
        }
        res.status(200).send({ message: 'Reporte agregado exitosamente', id: results.insertId });
    });
});


// Endpoint para obtener la lista de estudiantes
app.get('/get_estudiantes', (req, res) => {
    const query = `SELECT id_usuario, nombre FROM usuarios WHERE rol = 'estudiante';`;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener estudiantes');
        }
        res.status(200).send(results);
    });
});

// Endpoint para obtener la lista de estudiantes de un proyecto específico
app.post('/get_estudiantes_por_proyecto', (req, res) => {
    const { id_docente } = req.body; 

    const proyectoQuery = `
    SELECT p.id_proyecto 
    FROM proyectos p 
    JOIN usuarios u ON p.id_docente_a_cargo = u.id_usuario 
    WHERE u.id_usuario = ?;`;

    db.query(proyectoQuery, [id_docente], (err, proyectoResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor');
        }
        if (proyectoResults.length === 0) {
            return res.status(404).send({ message: 'No se encontró ningún proyecto para este docente.' });
        }

        const id_proyecto = proyectoResults[0].id_proyecto;

        const estudiantesQuery = `
        SELECT u.id_usuario, u.nombre 
        FROM usuarios u 
        JOIN inscripcion_proyectos i ON u.id_usuario = i.id_estudiante 
        WHERE i.id_proyecto = ? AND u.rol = 'estudiante';`;

        db.query(estudiantesQuery, [id_proyecto], (err, estudiantesResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al obtener estudiantes');
            }
            res.status(200).send(estudiantesResults);
        });
    });
});

app.post('/reportes_asignacion_salones', (req, res) => {
    const { nombre } = req.body; 

    if (!nombre) {
        return res.status(400).send('Por favor, proporcione un nombre de docente.');
    }

    const query = `
    SELECT 
        r.id_docente, 
        r.total_horas_cubiertas, 
        r.fecha_generacion, 
        u.nombre AS nombre_docente
    FROM reportes_asignacion_salones r
    JOIN usuarios u ON r.id_docente = u.id_usuario
    WHERE u.nombre = ?;`;

    db.query(query, [nombre], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor');
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'No se encontraron reportes de asignación de salones para este docente.' });
        }

        res.status(200).send({ reportes: results });
    });
});



app.post('/verificar_inscripcion_proyecto', (req, res) => {
    const { nombreEstudiante, nombreDocente } = req.body;
  
    if (!nombreEstudiante || !nombreDocente) {
      return res.status(400).send('Faltan datos necesarios.');
    }
  
    const verificarInscripcionQuery = `
      SELECT i.id_proyecto
      FROM inscripcion_proyectos i
      JOIN usuarios u ON u.id_usuario = i.id_estudiante
      JOIN proyectos p ON p.id_proyecto = i.id_proyecto
      JOIN usuarios d ON d.id_usuario = p.id_docente_a_cargo
      WHERE u.nombre = ? AND d.nombre = ?;
    `;
  
    db.query(verificarInscripcionQuery, [nombreEstudiante, nombreDocente], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error en el servidor');
      }
  
      if (results.length === 0) {
        return res.status(404).send({ esta_inscrito: false, message: 'El estudiante no está inscrito en el proyecto del docente.' });
      }
  
      // Si está inscrito, ahora traemos el historial de horas sociales
      const historialQuery = `
        SELECT 
          reportes_horas_sociales.total_horas, 
          reportes_horas_sociales.fecha_generacion,
          usuarios.nombre AS nombre_estudiante
        FROM reportes_horas_sociales 
        JOIN usuarios ON reportes_horas_sociales.id_estudiante = usuarios.id_usuario
        WHERE usuarios.nombre = ?;
      `;
  
      db.query(historialQuery, [nombreEstudiante], (err, historialResults) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error al obtener el historial de horas sociales.');
        }
  
        res.status(200).send({ esta_inscrito: true, horas_sociales: historialResults });
      });
    });
  });
  



app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
