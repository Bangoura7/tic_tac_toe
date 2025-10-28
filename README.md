# Tic Tac Toe

Un jeu de Tic Tac Toe interactif développé avec HTML, CSS et JavaScript en utilisant le pattern Module et les principes de séparation des responsabilités.

## Fonctionnalités

- **Écran de démarrage** avec saisie des noms des joueurs
- **Interface utilisateur moderne et responsive**
- **Modal de résultats** affichant le gagnant et les statistiques
- **Système de score** avec sauvegarde locale (localStorage)
- **Détection automatique** des gagnants et des matchs nuls
- **Animations visuelles** pour les cellules gagnantes
- **Navigation fluide** entre les différents écrans

## Comment jouer

1. **Démarrage** : Entrez les noms des deux joueurs (optionnel)
2. **Cliquez sur "Commencer la Partie"**
3. **Jouez** : Cliquez sur une cellule pour placer votre symbole (X ou O)
4. **Victoire** : Le premier joueur à aligner 3 symboles gagne
5. **Modal de résultat** : Affiche le gagnant et les statistiques
6. **Rejouer** : Utilisez "Rejouer" pour une nouvelle partie
7. **Menu** : Retournez au menu pour changer les noms des joueurs

## Structure du projet

```
tic_tac_toe/
├── index.html      # Structure HTML avec écran de démarrage et modal
├── style.css       # Styles modernes avec animations
├── script.js       # Architecture modulaire (Gameboard, Player, GameController)
├── .gitignore      # Fichiers à ignorer
└── README.md       # Documentation
```

## Architecture du code

Le code suit le **principe de responsabilité unique (SRP)** et utilise le **pattern Module** :

### Modules principaux

1. **Gameboard** (IIFE)
   - Gère l'état du plateau (tableau 3x3)
   - Vérifie les conditions de victoire
   - Responsable de la logique du plateau

2. **Player** (Factory Function)
   - Crée des objets joueurs avec nom et symbole
   - Gère le score individuel de chaque joueur

3. **ScoreManager** (IIFE)
   - Gère la persistance des scores dans localStorage
   - Séparation entre logique métier et persistance

4. **GameController** (IIFE)
   - Orchestre le flux du jeu
   - Coordonne Gameboard et Players
   - Gère les changements de tour

5. **DisplayController** (IIFE auto-exécuté)
   - Gère toute l'interface utilisateur
   - Séparation complète entre UI et logique métier
   - Affichage des écrans (démarrage, jeu, résultats)

## Technologies utilisées

- **HTML5** - Structure sémantique
- **CSS3** - Grid, Flexbox, Animations, Media Queries
- **JavaScript (ES6+)** - Module Pattern, Factory Functions, IIFE
- **LocalStorage** - Persistance des scores

## Principes de conception

✅ **Séparation des responsabilités** - Chaque module a un rôle unique  
✅ **Encapsulation** - Données privées et API publique minimale  
✅ **Building from inside out** - Logique métier indépendante de l'UI  
✅ **Code modulaire** - Facile à tester et maintenir  
✅ **Interface restrictive** - API simple et intuitive
