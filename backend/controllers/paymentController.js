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
 * Initialiser un paiement avec l'API PayDunya
 */
exports.initiatePayment = async (req, res) => {
    try {
        const { userId, amount, provider, planType } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ error: 'Données manquantes (userId, amount)' });
        }

        const paymentId = uuidv4();
        const orderId = `ORD-${Date.now()}`;
        
        await runQuery(
            `INSERT INTO payments (id, user_id, order_id, provider, amount, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [paymentId, userId, orderId, provider || 'PayDunya', amount, 'Pending']
        );

        if (process.env.SANDBOX === 'true') {
            // Mode Sandbox pur (sans appel API réel, simulation interne)
            const paymentUrl = `http://localhost:5000/api/payments/mock-checkout/${paymentId}`;
            await runQuery(`UPDATE payments SET payment_url = ? WHERE id = ?`, [paymentUrl, paymentId]);
            return res.status(200).json({ success: true, paymentId, paymentUrl });
        }

        // --- Appel de l'API PayDunya (Mode Réel) ---
        const paydunyaUrl = 'https://app.paydunya.com/api/v1/checkout-invoice/create';
        
        const payload = {
            "invoice": {
                "total_amount": amount,
                "description": `Abonnement ${planType || 'Premium'} sur Dépanne-Moi`
            },
            "store": {
                "name": process.env.PAYDUNYA_STORE_NAME || "Dépanne-Moi"
            },
            "custom_data": {
                "paymentId": paymentId,
                "userId": userId
            },
            "actions": {
                "cancel_url": process.env.RETURN_URL_CANCEL || "http://localhost:3000",
                "return_url": process.env.RETURN_URL_SUCCESS || "http://localhost:3000",
                "callback_url": process.env.PAYDUNYA_IPN_URL || "http://localhost:5000/api/payments/paydunya-ipn"
            }
        };

        const response = await fetch(paydunyaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
                'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
                'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("[PayDunya API Error]", errData);
            throw new Error("Erreur avec l'API PayDunya");
        }

        const data = await response.json();
        
        if (data.response_code === "00") {
            const paymentUrl = data.response_text; // C'est le lien sécurisé vers PayDunya
            await runQuery(`UPDATE payments SET payment_url = ?, transaction_id = ? WHERE id = ?`, [paymentUrl, data.token, paymentId]);
            
            res.status(200).json({
                success: true,
                paymentId,
                paymentUrl,
                message: 'Paiement PayDunya initié avec succès'
            });
        } else {
            throw new Error(`Code PayDunya ${data.response_code}: ${data.response_text || 'Détails inconnus'}`);
        }

    } catch (error) {
        console.error('[ERROR] Erreur lors de l\'initialisation du paiement:', error);
        res.status(500).json({ error: error.message || 'Erreur interne du serveur.' });
    }
};

/**
 * Endpoint IPN de PayDunya (Webhook)
 * Cette route est appelée secrètement par les serveurs de PayDunya
 */
exports.paydunyaIpn = async (req, res) => {
    try {
        console.log('[IPN] Notification PayDunya reçue !');
        
        const invoiceToken = req.body.data ? req.body.data.hash : req.body.hash;
        
        if (!invoiceToken) {
            return res.status(400).send("Token manquant");
        }

        // Pour valider l'IPN, il faut confirmer le statut de la facture avec PayDunya
        const confirmUrl = `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${invoiceToken}`;
        
        const response = await fetch(confirmUrl, {
            method: 'GET',
            headers: {
                'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
                'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
                'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN
            }
        });

        if (!response.ok) throw new Error("Erreur lors de la confirmation IPN");

        const data = await response.json();

        if (data.status === "completed") {
            const paymentId = data.custom_data.paymentId;
            const transactionId = data.receipt_id || invoiceToken;

            await runQuery(
                `UPDATE payments SET status = 'Success', transaction_id = ?, payment_date = CURRENT_TIMESTAMP WHERE id = ?`, 
                [transactionId, paymentId]
            );
            console.log(`[SUCCESS] Paiement ${paymentId} validé via IPN PayDunya !`);
        } else {
            console.log(`[IPN] Le paiement n'est pas encore complété. Statut: ${data.status}`);
        }

        res.status(200).send("IPN Processed");
    } catch (error) {
        console.error('[ERROR] Erreur IPN PayDunya:', error);
        res.status(500).send("IPN Error");
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
        
        res.send(`
            <html>
                <head>
                    <title>Paiement Sandbox</title>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f6f8; margin: 0; }
                        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                        .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 20px; color: white; width: 100%; }
                        .btn-success { background: #2ecc71; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Paiement Test (Sandbox Local)</h1>
                        <p>Montant à payer : <strong>${payment.amount} FCFA</strong></p>
                        <form method="POST" action="/api/payments/mock-checkout/${id}/process">
                            <button type="submit" name="status" value="Success" class="btn btn-success">✅ Simuler un Succès</button>
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
    const { status } = req.body;
    
    try {
        await runQuery(`UPDATE payments SET status = ?, transaction_id = 'TXN-MOCK-${Date.now()}', payment_date = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
        
        res.send(`
            <html>
                <body style="font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #f4f6f8; margin: 0; text-align: center;">
                    <h2 style="color: #2ecc71; font-size: 2rem;">✅ Paiement simulé avec succès !</h2>
                    <p style="color: #7f8c8d; font-size: 1.1rem;">Vous pouvez fermer cet onglet.</p>
                </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send('Erreur');
    }
};
