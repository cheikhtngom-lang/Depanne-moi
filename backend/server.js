require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
// On utilise json parser pour tout sauf si c'est un webhook spécifique nécessitant raw body (ex: Stripe, Wave strict)
// Pour la simplicité ici, on parse en JSON standard.
app.use(express.json());

// Routes
const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

// Pour servir les fichiers statiques du frontend (Optionnel, si on veut tout servir via le même serveur Node)
// app.use(express.static(path.join(__dirname, '../')));

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).json({ error: 'Une erreur interne est survenue !' });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Serveur Dépanne-Moi démarré`);
    console.log(`Port : ${PORT}`);
    console.log(`Mode Sandbox : ${process.env.SANDBOX}`);
    console.log(`=================================`);
});
