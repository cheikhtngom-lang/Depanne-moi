const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Fonction utilitaire pour exécuter une requête SQL asynchrone
const runQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const getQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

/**
 * Initialiser un paiement (Wave ou Orange Money)
 */
exports.initiatePayment = async (req, res) => {
    try {
        const { userId, amount, provider, planType } = req.body;

        // 1. Validation des données
        if (!userId || !amount || !provider) {
            return res.status(400).json({ error: 'Données manquantes (userId, amount, provider obligatoires)' });
        }

        if (provider !== 'Wave' && provider !== 'Orange Money') {
            return res.status(400).json({ error: 'Fournisseur de paiement non supporté' });
        }

        // 2. Création de la transaction en base de données avec statut Pending
        const paymentId = uuidv4();
        const orderId = `ORD-${Date.now()}`;
        
        await runQuery(
            `INSERT INTO payments (id, user_id, order_id, provider, amount, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [paymentId, userId, orderId, provider, amount, 'Pending']
        );

        // 3. Appel à l'API du fournisseur (Mocké pour l'exemple, car il faut des comptes marchands réels)
        let paymentUrl = '';
        
        if (process.env.SANDBOX === 'true') {
            // Mode Sandbox : on simule l'URL de redirection de paiement
            const returnUrlParam = req.body.returnUrl ? `?returnUrl=${encodeURIComponent(req.body.returnUrl)}` : '';
            paymentUrl = `http://localhost:5000/api/payments/mock-checkout/${paymentId}${returnUrlParam}`;
            
            // Mise à jour de l'URL dans la BDD
            await runQuery(`UPDATE payments SET payment_url = ? WHERE id = ?`, [paymentUrl, paymentId]);
        } else {
            // Mode Production : Appel réel aux APIs (à implémenter avec vos clés de production)
            if (provider === 'Wave') {
                // Logique Wave (ex: appel à https://api.wave.com/v1/checkout/sessions)
                // const waveResponse = await fetch('...', { headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` } });
                // paymentUrl = waveResponse.url;
            } else if (provider === 'Orange Money') {
                // Logique Orange Money (ex: Web Payment API)
                // paymentUrl = omResponse.payment_url;
            }
        }

        console.log(`[INIT] Paiement initié: ${paymentId} via ${provider} pour ${amount} FCFA`);

        // 4. Retourner l'URL de paiement au frontend
        res.status(200).json({
            success: true,
            paymentId,
            paymentUrl,
            message: 'Paiement initié avec succès'
        });

    } catch (error) {
        console.error('[ERROR] Erreur lors de l\'initialisation du paiement:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Webhook Wave
 */
exports.waveWebhook = async (req, res) => {
    try {
        console.log('[WEBHOOK] Réception Webhook Wave:', req.body);
        
        // 1. Vérification de la signature du Webhook (Sécurité)
        // const signature = req.headers['wave-signature'];
        // Vérifier avec process.env.WAVE_WEBHOOK_SECRET
        
        const { id, type, data } = req.body;
        
        // Si c'est un événement de paiement réussi
        if (type === 'checkout.session.completed') {
            const paymentId = data.client_reference; // ID qu'on aurait passé à la création
            // Mise à jour DB
            await runQuery(`UPDATE payments SET status = 'Success', transaction_id = ?, payment_date = CURRENT_TIMESTAMP WHERE id = ?`, [data.transaction_id, paymentId]);
            console.log(`[SUCCESS] Paiement Wave validé : ${paymentId}`);
        }
        
        res.status(200).send('Webhook reçu');
    } catch (error) {
        console.error('[ERROR] Webhook Wave erreur:', error);
        res.status(500).send('Erreur serveur');
    }
};

/**
 * Webhook Orange Money
 */
exports.orangeMoneyWebhook = async (req, res) => {
    try {
        console.log('[WEBHOOK] Réception Webhook Orange Money:', req.body);
        
        const { status, notif_token, txnid } = req.body;
        
        if (status === 'SUCCESS') {
            // Le txnid correspondrait à notre order_id
            await runQuery(`UPDATE payments SET status = 'Success', transaction_id = ?, payment_date = CURRENT_TIMESTAMP WHERE order_id = ?`, [notif_token, txnid]);
            console.log(`[SUCCESS] Paiement OM validé : ${txnid}`);
        } else if (status === 'FAILED') {
            await runQuery(`UPDATE payments SET status = 'Failed' WHERE order_id = ?`, [txnid]);
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('[ERROR] Webhook OM erreur:', error);
        res.status(500).send('Erreur serveur');
    }
};

/**
 * Vérifier le statut d'un paiement (utile pour le frontend)
 */
exports.checkStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await getQuery(`SELECT status FROM payments WHERE id = ?`, [id]);
        
        if (!payment) {
            return res.status(404).json({ error: 'Paiement introuvable' });
        }
        
        res.status(200).json({ status: payment.status });
    } catch (error) {
        console.error('[ERROR] Verification statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * MOCK: Simuler la page de paiement du fournisseur en mode Sandbox
 */
exports.mockCheckoutPage = async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await getQuery(`SELECT * FROM payments WHERE id = ?`, [id]);
        if (!payment) return res.status(404).send('Paiement introuvable');
        
        // Une page HTML très simple pour simuler le paiement côté fournisseur
        res.send(`
            <html>
                <head>
                    <title>Paiement Sandbox - ${payment.provider}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f6f8; margin: 0; }
                        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                        h1 { color: ${payment.provider === 'Wave' ? '#1c52f6' : '#ff6600'}; }
                        .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 20px; color: white; width: 100%; }
                        .btn-success { background: #2ecc71; }
                        .btn-danger { background: #e74c3c; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>${payment.provider} (Sandbox)</h1>
                        <p>Montant à payer : <strong>${payment.amount} FCFA</strong></p>
                        <p style="color: #7f8c8d; font-size: 14px;">Il s'agit d'une simulation de la page de paiement du fournisseur.</p>
                        
                        <form method="POST" action="/api/payments/mock-checkout/${id}/process">
                            <input type="hidden" name="returnUrl" value="${req.query.returnUrl || ''}">
                            <button type="submit" name="status" value="Success" class="btn btn-success">✅ Simuler un Succès</button>
                            <button type="submit" name="status" value="Failed" class="btn btn-danger">❌ Simuler un Échec</button>
                        </form>
                    </div>
                </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send('Erreur');
    }
};

/**
 * MOCK: Traiter la simulation de paiement
 */
exports.processMockCheckout = async (req, res) => {
    const { id } = req.params;
    const { status, returnUrl } = req.body; // 'Success' ou 'Failed'
    
    try {
        await runQuery(`UPDATE payments SET status = ?, transaction_id = 'TXN-MOCK-${Date.now()}', payment_date = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
        
        // Afficher une page de confirmation qui se ferme toute seule
        res.send(`
            <html>
                <body style="font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #f4f6f8; margin: 0; text-align: center;">
                    <h2 style="color: ${status === 'Success' ? '#2ecc71' : '#e74c3c'}; font-size: 2rem;">
                        ${status === 'Success' ? '✅ Paiement simulé avec succès !' : "❌ Simulation d'échec enregistrée !"}
                    </h2>
                    <p style="color: #7f8c8d; font-size: 1.1rem;">Vous pouvez fermer cet onglet et retourner sur le site principal.</p>
                    <script>
                        setTimeout(() => { window.close(); }, 4000);
                    </script>
                </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send('Erreur');
    }
};
