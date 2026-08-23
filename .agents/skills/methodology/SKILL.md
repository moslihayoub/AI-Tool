---
name: methodology
description: Guide d'ingénierie et méthodologie logicielle complète combinant Spec-Driven Development (SDD), architecture propre, intégrité des données, tests QA, ergonomie UI/UX et garde-fous de sécurité IA, adapté pour le projet Ai-Tool.
---

# 🚀 Guide de Méthodologie, Architecture & Tests (Master Skill)

Ce document constitue la référence absolue pour le développement, l'assurance qualité et la maintenance du projet Ai-Tool. Il s'applique à tous les développeurs et agents IA intervenant sur le codebase.

---

## 🏛️ 1. Architecture Globale & Standards de Code

Le code est structuré directement à la racine pour garantir l'isolation et la clarté (sans dossier `src/`) :
- `/components/` : Vues de l'application, modales, et primitives d'interface.
- `/services/` : Appels d'API externes (notamment Gemini API) et logique métier asynchrone.
- `/types.ts` : Contrats d'interfaces et définitions de types TypeScript partagés.
- `/i18n/` : Fichiers de traductions (multilingue).
- `App.tsx` : Point d'entrée gérant l'état global de l'application (React Hooks & LocalStorage).

### Règle TypeScript Absolue
- **Zéro `any`** : Tout type doit être explicitement défini dans `types.ts`.
- Validation stricte des données provenant du LocalStorage et de l'API Gemini pour éviter les corruptions d'état.

---

## 📋 2. Workflow Spec-Driven Development (SDD)

Toute fonctionnalité majeure ou refactor architectural doit respecter le cycle SDD :

1. **`specify` (Spécification) :** Rédiger le cahier des charges technique et fonctionnel.
2. **`clarify` & `plan` (Architecture) :** Résoudre les ambiguïtés, définir les types, et l'arborescence UI.
3. **`tasks` (Découpage) :** Établir une liste ordonnée de tâches atomiques et vérifiables.
4. **`implement` (Exécution) :** Implémenter le code en respectant scrupuleusement la spécification.
5. **`converge` (Validation & Tests) :** Valider que le livrable correspond au contrat initial.

---

## 💰 3. Intégrité des Données & Précision Métier

> **Règle non négociable :** Une application IA de traitement de CV et profils nécessite des données structurées et sans erreur de parsing.

- **Structures claires :** Utiliser systématiquement les types `CandidateProfile`, `CVFile`, etc.
- Toute donnée générée par le modèle d'IA (Gemini) doit être traitée comme incertaine tant qu'elle n'est pas formatée et validée selon nos contrats TypeScript.
- **Traçabilité :** Conserver la date (`createdAt`, `date`) de chaque traitement ou log pour le suivi.

---

## 🎨 4. Standards UI/UX & Responsive Design

- **Mobile-First :** Concevoir systématiquement l'expérience mobile d'abord.
- **Tailwind CSS :** Utilisation stricte des classes Tailwind existantes sans CSS en ligne (hors index.css si nécessaire).
- **Gestion Complète des États UI :**
  - ⏳ *Chargement* : Indicateurs visuels lors de l'appel à l'API Gemini.
  - ✅ *Succès* : Feedback immédiat via Toasts.
  - ❌ *Erreur* : Message explicite traduit via i18n, avec gestion des alertes techniques (plus d'alertes JS natives).

---

## 🤖 5. Sécurité de l'Agent IA & Garde-fous

1. **Données non-fiables :** Tout contenu JSON renvoyé par Gemini doit être sécurisé et casté proprement avant d'être injecté dans l'état de l'application.
2. **Prompting minimaliste :** N'injecter que le texte pertinent (ex: extraction base64) sans divulguer la logique interne au modèle.
3. **Journalisation :** (Règle stricte de ce projet) : **Toute modification** doit être historisée en ajoutant une entrée dans le tableau `currentLogs` de `components/InfraView.tsx`.

---

## 🧪 6. Protocole de Tests & Assurance Qualité (QA)

| Étape | Outil / Commande | Objectif |
| :--- | :--- | :--- |
| **1. Contrôle Statique** | `npx tsc --noEmit` & `npm run lint` (si configuré) | Zéro erreur de type et de syntaxe |
| **2. Build Vite** | `npm run build` | Vérification de la compatibilité ESM et des imports (ex: @google/genai) |
| **3. Smoke Tests E2E** | DevTools / Serveur Local | Contrôle visuel de la disposition (breakpoints) sur Desktop et Mobile |

---

## 🚀 7. Checklist Finale de Livraison & Déploiement

Avant toute finalisation de tâche :
- [ ] Le typage TypeScript est respecté (`types.ts`).
- [ ] Le log de modification est bien inséré dans `components/InfraView.tsx`.
- [ ] Le build de production s'exécute sans erreur (`npm run build`).
- [ ] Les traductions (i18n) sont à jour pour toute nouvelle chaîne de caractères.
- [ ] L'UI reste intacte sur mobile et respecte les contraintes d'impression (ex: export CV).
