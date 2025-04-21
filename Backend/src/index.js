const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const SECRET = 'papa'; //.env

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

// middleware token y usuario registrado

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user; // { id, role }
    next();
  });
}
  
// moddleware para ver si es admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }
  next();
}




// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '8h' });
    res.json({ token });
  });
});



// Crear usuario
app.post('/api/register', authenticateToken, requireAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validar que el rol sea 'admin' o 'normal'
  if (!['admin', 'normal'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }

      res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.insertId });
    }
  );
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
app.get('/api/diagrams', authenticateToken, (req, res) => {
  db.query('SELECT id, title, user_id, created_at FROM diagrams', (err, result) => {
    if(err) return res.status(500).send(err);
    res.json(result);      
  });
});


// Obtener un solo diagrama por id
app.get('/api/diagrams/:id', authenticateToken, (req, res) => {
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
app.post('/api/diagrams', authenticateToken, requireAdmin, (req, res) => {
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
app.put('/api/diagrams/:id', authenticateToken, requireAdmin, (req, res) => {
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
app.delete('/api/diagrams/:id', authenticateToken, requireAdmin, (req, res) => {
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

