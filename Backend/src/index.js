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












app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

