const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 1. Initialiser un paiement depuis le frontend
router.post('/initiate', paymentController.initiatePayment);

// 2. Vérifier le statut d'un paiement (pour le polling frontend)
router.get('/status/:id', paymentController.checkStatus);

// 3. Webhooks (Doivent être accessibles publiquement sur internet en production)
router.post('/webhooks/wave', paymentController.waveWebhook);
router.post('/webhooks/orange-money', paymentController.orangeMoneyWebhook);

// 4. Routes de Simulation (Sandbox uniquement)
router.get('/mock-checkout/:id', paymentController.mockCheckoutPage);
// On utilise express.urlencoded pour pouvoir traiter le formulaire classique
router.post('/mock-checkout/:id/process', express.urlencoded({ extended: true }), paymentController.processMockCheckout);

module.exports = router;
