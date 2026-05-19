const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// GET tous les étudiants (avec filtres)
router.get('/', (req, res) => {
  const { filiere, niveau, search } = req.query;
  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  if (filiere) { query += ' AND filiere = ?'; params.push(filiere); }
  if (niveau)  { query += ' AND niveau = ?';  params.push(niveau);  }
  if (search)  { query += ' AND (nom LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST ajouter un étudiant
router.post('/', (req, res) => {
  const { nom, email, telephone, adresse, filiere, niveau } = req.body;
  const id = uuidv4();
  db.run(
    `INSERT INTO students (id, nom, email, telephone, adresse, filiere, niveau) VALUES (?,?,?,?,?,?,?)`,
    [id, nom, email, telephone, adresse, filiere, niveau],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id, message: 'Étudiant ajouté avec succès' });
    }
  );
});

// PUT modifier un étudiant
router.put('/:id', (req, res) => {
  const { nom, email, telephone, adresse, filiere, niveau } = req.body;
  db.run(
    `UPDATE students SET nom=?, email=?, telephone=?, adresse=?, filiere=?, niveau=? WHERE id=?`,
    [nom, email, telephone, adresse, filiere, niveau, req.params.id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Étudiant modifié avec succès' });
    }
  );
});

// DELETE supprimer un étudiant
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM students WHERE id=?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Étudiant supprimé avec succès' });
  });
});

module.exports = router;