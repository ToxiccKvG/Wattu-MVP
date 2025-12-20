# WattU - Signalement Citoyen en Temps Réel (MVP)

**Plateforme de signalement citoyen pour améliorer les services publics au Sénégal**

### Démo Vidéo
[Voir la démonstration sur YouTube](https://youtu.be/-BGzReowc_k)

---

## Table des Matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [PWA (Progressive Web App)](#-pwa-progressive-web-app)
- [Déploiement sur Vercel](#-déploiement-sur-vercel)
- [Architecture](#-architecture)


---

## À propos

**WattU** est une plateforme web progressive (PWA) permettant aux citoyens de signaler des problèmes dans leur commune (pannes électriques, fuites d'eau, nids-de-poule, etc.) en temps réel, tout en donnant aux agents municipaux et administrateurs les outils pour gérer et résoudre ces signalements efficacement.

### Objectifs
- **Citoyens** : Signaler des problèmes facilement, suivre leur évolution
- **Agents** : Gérer les signalements de leur commune, définir des priorités
- **Administrateurs** : Vue d'ensemble nationale, analytics, gestion des communes

### Langues
- **Français** (interface principale)
- **Wolof** (interface citoyenne accessible)

---

## Fonctionnalités

### Pour les Citoyens (Public)
- **Création de signalements** sans compte requis
- **Upload de photos** avec compression automatique
- **Géolocalisation GPS** ou sélection manuelle sur carte
- **Carte interactive** pour visualiser tous les signalements
- **Multilingue** : Français / Wolof
- **Progressive Web App** : Installation sur mobile/desktop

### Pour les Agents (Authentifiés)
- **Connexion sécurisée** (email/mot de passe)
- **Dashboard** avec statistiques en temps réel
- **Gestion des signalements** de leur commune uniquement
- **Mise à jour de statuts** (en attente → en cours → résolu/rejeté)
- **Définition de priorités** (basse, normale, haute, urgente)
- **Carte des signalements** de la commune
- **Export CSV** des données

### Pour les Administrateurs
- **Vue globale** de tous les signalements (toutes communes)
- **Analytics avancés** : statistiques, tendances, top communes
- **Graphiques** d'évolution sur 30 jours
- **Gestion multi-communes**
- **Export CSV avancé** avec colonnes sélectionnables

---

## Stack Technique

### Frontend
- **React 19** - Interface utilisateur
- **Vite 6** - Build tool ultra-rapide
- **React Router v7** - Routing (SPA)
- **Tailwind CSS v4** - Styling moderne
- **shadcn/ui** - Composants UI réutilisables
- **Lucide React** - Icônes modernes
- **i18next** - Internationalisation (FR/Wolof)
- **Leaflet.js** - Cartes interactives (OpenStreetMap)

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL (base de données)
  - Auth (authentification)
  - Storage (stockage d'images)
  - Row Level Security (RLS) - Sécurité des données

### Optimisations & UX
- **Vite PWA Plugin** - Progressive Web App
- **Workbox** - Service Worker pour offline/caching
- **React Lazy** - Code splitting pour performance
- **browser-image-compression** - Compression d'images
- **Sonner** - Toast notifications modernes
- **Recharts** (lazy loaded) - Data visualization

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** >= 18.x ([Télécharger](https://nodejs.org/))
- **npm** >= 9.x (inclus avec Node.js)

- **Git ->  cloner  [url de mon projet ]** (pour cloner le projet)

---

## Installation

### 1. Cloner le projet

```bash
git clone [url_du_projet]
cd wattu/wattu-app
```

### 2. Installer les dépendances

```bash
npm install
```



## Développement

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

### Comptes de test

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Admin** | `admin@wattu.sn` | `Admin123!` | Toutes communes, analytics |
| **Agent Dakar** | `agent.dakar@wattu.sn` | `Agent123!` | Signalements de Dakar uniquement |
| **Agent Saint-Louis** | `agent.stlouis@wattu.sn` | `Agent123!` | Signalements de Saint-Louis uniquement |
| **Citoyen** | Aucun compte requis | - | Création de signalements, carte |

### Routes de l'application

| Route | Rôle | Description |
|-------|------|-------------|
| `/` | Public | Page d'accueil (Dashboard citoyen) |
| `/carte` | Public | Carte interactive des signalements |
| `/signalements/nouveau` | Public | Formulaire de signalement |
| `/parametres` | Public | Paramètres (langue FR/Wolof) |
| `/login` | Public | Connexion agents/admins |
| `/agent/dashboard` | Agent | Dashboard agent |
| `/agent/reports` | Agent | Liste des signalements |
| `/agent/reports/:id` | Agent | Détail d'un signalement |
| `/admin/dashboard` | Admin | Dashboard admin (analytics) |
| `/admin/reports` | Admin | Table de tous les signalements |
| `/admin/reports/:id` | Admin | Détail d'un signalement |

---
Pour vous connecter aux sections Agent et Admin vous devrais taper dans l'url /login pour mettre les Credentials correspondants 
---

---

## Architecture

### Structure du projet

```
wattu-app/
├── public/               # Fichiers statiques
│   ├── icons/            # Icônes PWA 
│   ├── locales/          # Traductions i18n
│   │   ├── fr/           # Français
│   │   └── wo/           # Wolof
│   └── manifest.json     # PWA Manifest
├── src/
│   ├── api/              # Appels Supabase (reportApi, storageApi)
│   ├── components/       # Composants React
│   │   ├── admin/        # Composants admin (GlobalStats, TrendsChart)
│   │   ├── forms/        # Formulaires (SignalementForm)
│   │   ├── maps/         # Composants carte (MapView)
│   │   ├── reports/      # Composants signalements (ReportCard, StatusBadge)
│   │   ├── shared/       # Composants partagés (RequireAuth, LanguageSwitcher)
│   │   └── ui/           # Composants shadcn/ui (button, card, dialog, etc.)
│   ├── config/           # Configuration (Supabase, i18n)
│   ├── context/          # React Contexts (AuthContext, LangContext)
│   ├── hooks/            # Custom Hooks (useAuth, useGeolocation, useReports)
│   ├── layouts/          # Layouts (PublicLayout, AgentLayout, AdminLayout)
│   ├── pages/            # Pages par rôle
│   │   ├── Citizen/      # Pages citoyennes (HomePage, NewSignalement, CitizenMap)
│   │   ├── Agent/        # Pages agents (AgentDashboard, ReportList, ReportDetail)
│   │   └── Admin/        # Pages admins (AdminDashboard, GlobalReports)
│   ├── services/         # Business Logic (reportService, authService)
│   ├── utils/            # Utilitaires (tracking, validation)
│   ├── App.jsx           # Composant principal
│   ├── main.jsx          # Point d'entrée React
│   └── index.css         # CSS global (Tailwind imports)
├── vite.config.js        # Config Vite + PWA Plugin
├── package.json          # Dépendances
├── README.md             # Documentation (ce fichier)
└── PWA_TEST_GUIDE.md     # Guide de test PWA

documentation/             # Documentation projet (dans le repo parent)
├── PRD.md                # Product Requirements Document
├── Implementation.md     # Plan d'implémentation + Stages
├── database_schema.md    # Schéma Supabase + RLS
├── UI_UX_doc.md          # Design system + Guidelines UX
├── bug_tracking.md       # Suivi des bugs connus
└── project_structure.md  # Structure du projet + Conventions
```
