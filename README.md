# Projet MongoDB - Application de démonstration

Ce README explique comment installer, configurer et démarrer l'application localement (Windows PowerShell).

## Prérequis
- Node.js (>= 18 recommandé)
- npm
- MongoDB local ou accès à un serveur MongoDB

## Installation
1. Ouvrez PowerShell dans le dossier du projet.
2. Installez les dépendances :

```powershell
npm install
```

## Variables d'environnement
L'application lit les variables d'environnement suivantes :

- `MONGO_URL` : URL de connexion MongoDB (par défaut `mongodb://localhost:27017`).
- `DB_NAME_AIRBNB` : Nom de la base principale utilisée par l'app (par défaut `sample_airbnb`).
- `DB_NAME` : Nom de la base utilisée pour les users (par défaut `users`).
- `PORT` : Port d'écoute (par défaut `3000`).
- `SESSION_SECRET` : Secret pour `express-session`.
- `CORS_ORIGINS` : Origines autorisées CORS (CSV), ex: `http://localhost:3000`.


## Démarrer l'application

```powershell
npm start
```

Le serveur écoute sur `http://localhost:3000` (sauf si `PORT` modifié).

## Vérifications rapides

- Page de login : `http://localhost:3000/login`.
- Accès protégé : si vous accédez à `http://localhost:3000/` sans être connecté, vous serez redirigé vers `/login`.

## Schéma de la collection `users`

La collection `users` doit contenir au minimum les champs suivants : `name`, `email`, `password` (le mot de passe stocké doit être haché avec `bcrypt`).

Exemple de document valide :

```json
{
	"name": "a",
	"email": "a@a",
	"password": "$2a$12$WB31RQXWH.JpAqhAb.3k9e4cyhNkC31zl6ahIrS.J.XLJHOygog0i",
}
```

## Préparer la base de données pour les tests

Avant de lancer les tests, vous devez créer la base `users` et y ajouter un utilisateur de test.

Ouvrez un shell Mongo :

```powershell
mongosh

use users;

db.users.insertOne({
    name: "a",
    email: "a@a.fr",
    password: "$2a$12$WB31RQXWH.JpAqhAb.3k9e4cyhNkC31zl6ahIrS.J.XLJHOygog0i"
});
```

Ensuite lancer le projet pour pouvoir lancer les tests.
```powershell
node server.js
npm test
```
