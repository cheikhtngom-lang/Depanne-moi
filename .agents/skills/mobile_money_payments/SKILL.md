---
name: mobile_money_payments
description: Gère l'intégration des paiements réels Wave et Orange Money au Sénégal via l'API PayDunya.
---

# Compétence de Paiement (Wave & Orange Money)

Ce projet utilise l'agrégateur **PayDunya** pour accepter les paiements réels par **Wave**, **Orange Money** et **Free Money** au Sénégal. L'argent est ainsi transféré automatiquement sur le compte personnel ou bancaire du propriétaire du site.

## 1. Contexte et Architecture

Étant donné que l'application "Dépanne-Moi" est construite sans serveur Node.js backend (exclusivement en HTML/JS vanilla + Supabase pour la base de données), l'intégration sécurisée d'une API de paiement comme PayDunya **nécessite** l'utilisation de **Supabase Edge Functions**. 

- Le code JavaScript côté client (`payment.js`) prépare la commande.
- Il fait appel à l'Edge Function Supabase (qui cache les clés secrètes `MASTER_KEY`, `PRIVATE_KEY`).
- L'Edge Function contacte l'API PayDunya pour obtenir un lien/token de paiement sécurisé.
- Le client est redirigé vers l'interface de paiement, où il valide le paiement sur son application (Wave ou Orange Money).
- PayDunya envoie un Webhook (requête IPN) à l'Edge Function pour confirmer le paiement.
- Supabase met à jour le statut de l'artisan en "Premium".

## 2. Configuration des Clés PayDunya

Pour que les paiements tombent sur le compte réel du propriétaire, il doit ouvrir un compte marchand sur [PayDunya.com](https://paydunya.com) et récupérer ses clés d'intégration :
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_TOKEN`

Ces clés doivent être insérées dans les **Secrets de Supabase** (`supabase secrets set ...`). Elles ne doivent **JAMAIS** être exposées dans le code front-end (`index.html` ou `main.js`).

## 3. Simulation actuelle (Mode "Vibe Coding")

Tant que les clés réelles de production ne sont pas configurées, le système utilise un fichier `payment.js` local qui *simule* le comportement de la passerelle.
- Lors du clic sur "Wave" ou "Orange Money", un faux processus de validation est lancé.
- Une promesse simule le délai réseau et la validation côté utilisateur.
- Ce fichier sert de base (squelette) pour la future implémentation de l'appel `fetch()` vers l'Edge Function Supabase.

## 4. Instructions pour les Modèles IA Futurs

Si l'utilisateur vous demande de "mettre en ligne les vrais paiements", voici les étapes que vous devrez suivre :
1. Demandez à l'utilisateur de vous fournir ses clés d'API **Test** de PayDunya (Token, Master Key).
2. Créez un dossier `supabase/functions/paydunya-checkout` contenant l'Edge Function Deno.
3. Modifiez `payment.js` pour remplacer le `setTimeout` simulé par un vrai `fetch()` pointant vers l'URL de l'Edge Function Supabase.
4. Expliquez à l'utilisateur comment déployer l'Edge Function via le terminal Supabase (`supabase functions deploy paydunya-checkout`).
