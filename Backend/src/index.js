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
    'SELECT 1 + 1 AS resultado', (err, result) => {
      if(err) {
        return res.status(500).json({ conectado:false, Error: err.message })
      }

      res.json({ conectado: true, resultado: result[0].resultado })
    }
  )
})





// app.get('/', (req, res) => {
//   res.json({
//     "name":"santiago",
//     "age":"20"
//   })
// })




// Middleware para verificar el token JWT
// const authenticateJWT = (req, res, next) => {
//   const token = req.header('Authorization');
//   if (!token) return res.status(403).send('Acceso denegado.');

//   jwt.verify(token, 'secretkey', (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// // Rutas para usuarios
// app.post('/api/register', (req, res) => {
//   const { username, email, password, role } = req.body;
//   bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) throw err;
//     const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
//     db.query(query, [username, email, hashedPassword, role], (err, result) => {
//       if (err) throw err;
//       res.send('Usuario creado');
//     });
//   });
// });


// app.post('/api/login', (req, res) => {
//   const { email, password } = req.body;
//   const query = `SELECT * FROM users WHERE email = ?`;
//   db.query(query, [email], (err, results) => {
//     if (err) throw err;
//     if (results.length === 0) return res.status(400).send('Usuario no encontrado.');

//     const user = results[0];
//     bcrypt.compare(password, user.password, (err, isMatch) => {
//       if (err) throw err;
//       if (!isMatch) return res.status(400).send('Contraseña incorrecta.');

//       const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
//       res.json({ token });
//     });
//   });
// });

// // Rutas para diagramas
// app.post('/api/diagrams', authenticateJWT, (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).send('Acceso denegado.');
//   const { title } = req.body;
//   const query = `INSERT INTO diagrams (title, created_by) VALUES (?, ?)`;
//   db.query(query, [title, req.user.id], (err, result) => {
//     if (err) throw err;
//     res.send('Diagrama creado');
//   });
// });

// app.get('/api/diagrams', authenticateJWT, (req, res) => {
//   const query = `SELECT * FROM diagrams WHERE created_by = ? OR EXISTS (SELECT 1 FROM users WHERE role = 'admin')`;
//   db.query(query, [req.user.id], (err, results) => {
//     if (err) throw err;
//     res.json(results);
//   });
// });

// app.put('/api/diagrams/:id', authenticateJWT, (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).send('Acceso denegado.');
//   const { title } = req.body;
//   const query = `UPDATE diagrams SET title = ? WHERE id = ? AND created_by = ?`;
//   db.query(query, [title, req.params.id, req.user.id], (err, result) => {
//     if (err) throw err;
//     res.send('Diagrama actualizado');
//   });
// });

// app.delete('/api/diagrams/:id', authenticateJWT, (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).send('Acceso denegado.');
//   const query = `DELETE FROM diagrams WHERE id = ? AND created_by = ?`;
//   db.query(query, [req.params.id, req.user.id], (err, result) => {
//     if (err) throw err;
//     res.send('Diagrama eliminado');
//   });
// });

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
