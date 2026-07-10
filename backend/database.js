const dotenv = require('dotenv');
// Charger les variables d'environnement
dotenv.config();

// Nous n'utilisons plus SQLite, mais la REST API de Supabase !
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://igjsahmxeqoblkfpzrba.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnanNhaG14ZXFvYmxrZnB6cmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1ODkxODgsImV4cCI6MjA5OTE2NTE4OH0.HV7J3wQ8JmoOqX_mOz3GQ0CH5iJ2dipiUPSneJB1jW0';

// Fonction utilitaire pour exécuter une requête SQL (Insert/Update)
const runQuery = async (query, params) => {
    // Cette fonction est une adaptation pour rester compatible avec l'ancien code paymentController
    // Elle parse de manière très basique la requête SQL pour faire le bon appel REST Supabase
    
    if (query.toUpperCase().startsWith('INSERT INTO PAYMENTS')) {
        // [paymentId, userId, orderId, provider, amount, 'Pending']
        const payload = {
            id: params[0],
            user_id: params[1],
            order_id: params[2],
            provider: params[3],
            amount: params[4],
            status: params[5]
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error('Erreur Supabase INSERT: ' + err);
        }
        return true;
    } 
    
    if (query.toUpperCase().startsWith('UPDATE PAYMENTS SET PAYMENT_URL = ?, TRANSACTION_ID = ? WHERE ID = ?')) {
        const payload = { payment_url: params[0], transaction_id: params[1] };
        const id = params[2];

        const response = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Erreur Supabase UPDATE');
        return true;
    }

    if (query.toUpperCase().startsWith("UPDATE PAYMENTS SET STATUS = 'SUCCESS', TRANSACTION_ID = ?, PAYMENT_DATE = CURRENT_TIMESTAMP WHERE ID = ?")) {
        const payload = { status: 'Success', transaction_id: params[0], payment_date: new Date().toISOString() };
        const id = params[1];

        const response = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Erreur Supabase UPDATE IPN');
        return true;
    }

    console.warn("Query non supportée par l'adaptateur Supabase :", query);
    return true;
};

const getQuery = async (query, params) => {
    if (query.toUpperCase().startsWith('SELECT STATUS FROM PAYMENTS WHERE ID = ?')) {
        const id = params[0];
        const response = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}&select=status`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    }
    return null;
};

module.exports = {
    run: (query, params, callback) => {
        runQuery(query, params).then(res => callback(null)).catch(err => callback(err));
    },
    get: (query, params, callback) => {
        getQuery(query, params).then(res => callback(null, res)).catch(err => callback(err, null));
    }
};
