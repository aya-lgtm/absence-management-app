const express = require('express');
const router = express.Router();

// Route de test pour vérifier si l'API de mail répond
// Accessible via GET http://localhost:3000/api/emails/test
router.get('/test', (req, res) => {
    res.json({ message: "Le service d'email est prêt !" });
});

// Route pour envoyer un mail (Logique à compléter avec Nodemailer plus tard)
router.post('/send', (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ error: "Champs manquants (to, subject, message)" });
    }

    console.log(`Simulation d'envoi de mail à : ${to}`);
    
    // C'est ici que tu ajouteras la configuration Nodemailer
    res.json({ 
        success: true, 
        message: "Email envoyé avec succès (simulation)." 
    });
});

module.exports = router;
