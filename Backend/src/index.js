const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();


const app = express();

const port = 5000;


// Configurar CORS
app.use(cors());
app.use(bodyParser.json());


// Conexión con la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


db.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos');
});


app.get('/', (req, res) => {
  db.query(
    'SELECT 1 + 3  AS resultado', (err, result) => {
      if(err) {
        return res.status(500).json({ conectado:false, Error: err.message })
      }

      res.json({ conectado: true, resultado: result[0].resultado })
    }
  )
})




// Endpoints de diagramas


// Obtener lista de diagramas
app.get('/api/diagrams', (req, res) => {
  db.query('SELECT id, title, user_id, created_at FROM diagrams', (err, result) => {
    if(err) return res.status(500).send(err);
    res.json(result);      
  });
});


// Obtener un solo diagrama por id
app.get('/api/diagrams/:id', (req, res) => {
  const diagramId = req.params.id;

  db.query('SELECT data FROM diagrams WHERE id = ?', [diagramId], (err, result) => {
    if (err) return res.status(500).send(err);
    if (!result || result.length === 0 || !result[0].data) {
      return res.status(404).json({ nodes: [], edges: [] });
    }

    try {
      const [nodes, edges] = JSON.parse(result[0].data);
      res.json({ nodes, edges });
    } catch (e) {
      console.error('Error al parsear los datos:', e.message);
      res.status(500).json({ error: 'Error al leer los datos del diagrama' });
    }
  });
});


// Crear un diagrama
app.post('/api/diagrams', (req, res) => {
  const { title, content, user_id, nodes, edges } = req.body;

  if (!title || !user_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const data = JSON.stringify([nodes || [], edges || []]);

  db.query(
    'INSERT INTO diagrams (title, content, user_id, data) VALUES (?, ?, ?, ?)',
    [title, content || '', user_id, data],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).json({ message: 'Diagrama creado', diagramId: result.insertId });
    }
  );
});


// Actualizar un diagrama por id
app.put('/api/diagrams/:id', (req, res) => {
  const diagramId = req.params.id;
  const { title, content, nodes, edges } = req.body;
  const data = JSON.stringify([nodes || [], edges || []]);

  db.query(
    'UPDATE diagrams SET title = ?, content = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, data, diagramId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Diagrama no encontrado' });
      }
      res.json({ message: 'Diagrama actualizado' });
    }
  );
});


// Eliminar un diagrama por id
app.delete('/api/diagrams/:id', (req, res) => {
  const diagramId = req.params.id;

  db.query('DELETE FROM diagrams WHERE id = ?', [diagramId], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    res.json({ message: 'Diagrama eliminado correctamente' });
  });
});





app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

