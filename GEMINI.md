# Contexte du Projet : Dépanne-Moi (SaaS)

Ce fichier sert de dossier de passation (contexte) pour tout futur modèle d'IA travaillant sur ce projet. Il résume l'état actuel de l'application, ses fonctionnalités, sa structure et ses contraintes techniques.

## 1. Ce que l'application fait
"Dépanne-Moi" est une plateforme web (SaaS) de mise en relation entre des artisans locaux (plombiers, électriciens, mécaniciens, etc.) et des clients au Sénégal (Dakar, Rufisque, etc.). 
L'application permet aux artisans de s'inscrire, de choisir un abonnement (Standard ou Premium) et d'être listés. Du côté administrateur, elle offre un tableau de bord complet pour gérer les inscriptions, les paiements, la facturation et les utilisateurs.

## 2. Toutes les fonctionnalités implémentées
* **Inscription Artisan (`index.html`)** : Formulaire multi-étapes, géolocalisation, choix de la formule (Standard/Premium), intégration factice des paiements (Wave, Orange Money), et génération de facture.
* **Profil Public Artisan (`artisan.html`)** : Affichage dynamique des informations de l'artisan. Les membres "Premium" bénéficient d'un lecteur audio pour une description vocale.
* **Tableau de Bord Administrateur (`admin.html` / `admin.js`)** :
  * **Sécurité** : Page de connexion avec protection anti-force brute (limite de 5 tentatives par minute, stockée en local).
  * **Recherche Globale** : Barre de recherche textuelle et filtre par date (calendrier) fonctionnant sur tous les tableaux.
  * **Gestion des Utilisateurs** : CRUD complet (Ajout, Modification, Suppression, Blocage).
  * **Vues spécifiques** : Listes dédiées pour les "Abonnés Premium" et "Abonnés Standard", facilement accessibles via des boutons dans la barre supérieure.
  * **Facturation** : Suivi des paiements, calcul de la TVA à 18% (Sénégal), devise en FCFA, et génération de reçus WhatsApp dynamiques.
  * **Modale de Profil Admin** : Prévisualisation des profils artisans depuis l'espace admin.
* **Facture Dynamique (`facture.html`)** : Génération de factures imprimables basées sur l'ID de l'artisan.

## 3. La structure des fichiers
* `index.html` : Landing page et flux d'inscription des artisans.
* `artisan.html` & `artisan.js` : Vue publique du profil d'un artisan.
* `admin.html`, `admin.css`, `admin.js` : L'écosystème complet du tableau de bord administrateur (Interface, styles, et logique).
* `facture.html` : Modèle de facture dynamique.
* `styles.css` : Styles globaux de l'application cliente.

## 4. Les technologies utilisées
* **Frontend** : HTML5 sémantique, CSS3 (Vanilla), JavaScript (Vanilla ES6+).
* **Persistance des données** : `localStorage` et `sessionStorage` du navigateur. **Il n'y a pas de base de données backend ni de serveur API.**
* **Design System** : Approche "Glassmorphism" (panneaux en verre, flou d'arrière-plan), variables CSS personnalisées, design responsif.

## 5. Les décisions de design
* **Architecture Vibe-Codée / Prototype** : Le choix a été fait de construire une application entièrement fonctionnelle côté client pour un prototypage rapide. Toutes les données (utilisateurs, ouvriers, tentatives de connexion) sont simulées via le `localStorage`.
* **Esthétique Premium** : Utilisation d'animations fluides (`fadeIn`, `slideUp`), d'effets de survol ("magnetic buttons"), de badges colorés pour différencier les abonnements, et de fenêtres modales superposées pour éviter les rechargements de page.
* **Localisation** : Devise fixée en FCFA, TVA à 18%, et intégration de méthodes de paiement locales (Orange Money, Wave).

## 6. Instructions pour un futur modèle IA
* **Gestion des Données** : Ne tentez pas de faire des requêtes `fetch` vers un backend ou d'utiliser une base de données SQL/NoSQL. Toutes les modifications de données DOIVENT interagir avec `localStorage` (clés principales : `depanne_workers`, `depanne_users`, `admin_login_attempts`).
* **Sécurité XSS** : Continuez d'utiliser la fonction `escapeHTML()` présente dans `admin.js` avant d'injecter des données utilisateur dans le DOM via `innerHTML`.
* **Style CSS** : Maintenez l'esthétique Glassmorphism. Ne modifiez pas l'apparence générale pour la rendre basique ; l'utilisateur exige une qualité visuelle "Premium" et impressionnante (animations, ombres portées, couleurs harmonieuses). Utilisez les variables CSS existantes dans `admin.css` et `styles.css`.
* **UI/UX** : Privilégiez les modales (overlays) pour les nouvelles fonctionnalités d'édition plutôt que de créer de nouvelles pages HTML.
