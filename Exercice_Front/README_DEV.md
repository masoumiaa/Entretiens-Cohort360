# Exercice Front-End - React + TypeScript

## Installation et Configuration

### Prérequis
- Node.js ≥ 18
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Variables d'environnement

Créez un fichier `.env.local` basé sur `.env.example`:

```bash
cp .env.example .env.local
```

Configurez l'URL de l'API:

```
VITE_API_URL=http://localhost:8000
```

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible à `http://localhost:5173/`

### Construction pour la production

```bash
npm run build
```

### Lint et formatage

```bash
npm run lint
```

## Architecture du Projet

```
src/
├── components/
│   ├── PrescriptionList/          # Composant de liste avec filtrage
│   │   ├── PrescriptionList.tsx
│   │   └── PrescriptionList.css
│   └── PrescriptionForm/          # Composant de formulaire de création
│       ├── PrescriptionForm.tsx
│       └── PrescriptionForm.css
├── services/
│   └── api.ts                     # Client axios et requêtes API
├── types/
│   └── index.ts                   # Types TypeScript
├── App.tsx                        # Composant principal
├── App.css                        # Styles globaux
└── main.tsx                       # Point d'entrée
```

## Fonctionnalités

### 1. Liste des Prescriptions
- Affichage de toutes les prescriptions avec détails du patient et du médicament
- **Filtres disponibles:**
  - Recherche par patient
  - Recherche par médicament
  - Filtrage par statut (Valide, En attente, Supprimée)
  - Filtrage par plage de dates de début/fin
- Suppression de prescriptions
- Actualisation des données

### 2. Création de Prescription
- Formulaire complet avec validation
- Sélection du patient depuis une liste
- Sélection du médicament depuis une liste
- Dates de début et fin avec validation (end_date >= start_date)
- Statut défini par défaut à "en_attente"
- Champ commentaire optionnel
- Feedback utilisateur (succès/erreur)
- Redirection vers la liste après création réussie

## Technologies Utilisées

- **React 18** - Framework UI
  - Composants modernes avec Hooks (useState, useEffect)
  - Gestion d'état simple et efficace
  - Écosystème riche et mature

- **TypeScript** - Typage statique
  - Détection des erreurs à la compilation
  - Meilleure maintenabilité et documentation du code
  - Autocomplétion IDE optimale
  - Interfaces strictes pour les données API

- **Vite** - Bundler et dev server ultra-rapide
  - Hot Module Replacement (HMR) instantané
  - Temps de build extrêmement rapides (ms)
  - Optimisation automatique pour la production
  - Configuration minimale, zéro-config

- **Axios** - Client HTTP
  - Intercepteurs pour centraliser la gestion des erreurs
  - Support natif des JSON
  - Meilleure DX que fetch API
  - Facile à mocker pour les tests

- **CSS3** - Styles modernes
  - Flexbox et Grid pour layouts responsive
  - Variables CSS pour thème cohérent (dark mode)
  - Pas de dépendances CSS supplémentaires
  - Performances optimales

- **Vitest + React Testing Library** - Testing
  - Framework de test ultra-rapide (compatible Vite)
  - RTL encourage les tests orientés utilisateur
  - jsdom pour environnement DOM complet
  - Couverture de tests claire et maintenable

## Qualité du Code

- ✅ Code TypeScript strictement typé
- ✅ Séparation des concerns (composants, services, types)
- ✅ Composants réutilisables et bien structurés
- ✅ Gestion d'erreurs et feedback utilisateur
- ✅ Design responsive (mobile-first)
- ✅ CSS organisé et maintenable

## Intégration API

Le client API (`src/services/api.ts`) expose les méthodes suivantes:

```typescript
// Prescriptions
prescriptionAPI.list(filters?: PrescriptionFilters)    // GET /Prescription
prescriptionAPI.create(payload)                        // POST /Prescription
prescriptionAPI.update(id, payload)                    // PATCH /Prescription/<id>
prescriptionAPI.delete(id)                             // DELETE /Prescription/<id>

// Patients
patientAPI.list()                                      // GET /Patient

// Médicaments
medicationAPI.list()                                   // GET /Medication
```

## Améliorations Futures

- [ ] Édition de prescriptions existantes
- [ ] Pagination de la liste des prescriptions
- [ ] Tri par colonne
- [ ] Recherche textuelle
- [ ] Statistiques et tableaux de bord
- [ ] Authentification utilisateur
- [ ] Historique des modifications
