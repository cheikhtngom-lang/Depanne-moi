/**
 * Service de Paiement - Intégration PayDunya (Wave, Orange Money)
 * Ce fichier gère la communication avec l'API PayDunya pour générer des liens de paiement.
 */

const PaydunyaService = {
    // Le backend local tourne sur le port 5000
    API_URL: 'http://localhost:5000/api/payments/initiate',

    /**
     * Initie un paiement avec PayDunya
     * @param {Object} workerData - Les données de l'artisan (nom, prix, formule)
     * @returns {Promise<Object>} - Renvoie l'URL de paiement ou une erreur
     */
    async initPayment(workerData) {
        try {
            console.log(`[PayDunya] Initialisation du paiement pour ${workerData.name} - ${workerData.price} FCFA`);
            
            // Appel sécurisé vers le serveur Backend Node.js
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: workerData.price,
                    planType: workerData.plan,
                    provider: workerData.paymentMethod || 'Wave', // Wave ou Orange Money
                    userId: workerData.id.toString()
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error("Erreur Backend: " + errText);
            }

            const data = await response.json();
            return {
                success: true,
                paymentUrl: data.paymentUrl // L'URL sécurisée générée par PayDunya
            };

        } catch (error) {
            console.error("[PayDunya Error]", error);
            return { success: false, error: error.message };
        }
    }
};

window.PaydunyaService = PaydunyaService;
