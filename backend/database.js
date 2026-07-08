const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connexion à la base de données SQLite (stockée dans le dossier backend)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données SQLite:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Création de la table payments si elle n'existe pas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            order_id TEXT,
            provider TEXT NOT NULL,
            transaction_id TEXT,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'XOF',
            phone_number TEXT,
            status TEXT DEFAULT 'Pending',
            payment_url TEXT,
            payment_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table payments:', err.message);
        } else {
            console.log('Table payments prête.');
        }
    });
});

module.exports = db;
