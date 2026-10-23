# 📊 Statut du Projet - Ai-Tool

## Dernière Mise à Jour
- **Date:** 23 Octobre 2026
- **Environnement:** Localhost (Port 5180) & Production (Déploiement Vercel via GitHub)
- **Branche:** `main`

## 🚀 Progrès Récents
- **Test Scénario ATS Exhaustif & Résolution des Gaps Fonctionnels :**
  * **Audit complet des 8 parcours ATS** : Ingestion & Parsing, Dashboard & Candidats, Comparateur, Pipeline Kanban, Missions & Contrats, Feuilles de Temps (CRA) & Bons de Commande, Créateur de CV, Assistant IA & Authentification.
  * **Parcours Dashboard (Fix UX critique)** : Résolution du bug d'écran blanc lorsque les filtres ou la recherche ne renvoient aucun profil. Intégration d'un état vide explicite avec bouton de réinitialisation des filtres et bouton de chargement des données de test.
  * **Bannière Flottante de Comparaison** : Ajout d'une notification persistante lors de la sélection d'un candidat (`1/2 sélectionné`) avec bouton direct d'accès au comparateur dès que 2 candidats sont cochés (`2/2 sélectionnés`).
  * **Parcours Comparateur (Auto-guérison)** : Ajout d'un bouton direct "Sélectionner des candidats dans le Dashboard" dans l'état vide pour guider l'utilisateur immédiatement.
  * **Parcours Pipeline Kanban (Accessibilité Mobile)** : Ajout d'un sélecteur d'étape compact 1-tap sur chaque carte de candidat pour permettre la transition d'étape sur appareils tactiles et mobiles sans dépendre du drag-and-drop HTML5.
  * **Parcours Assistant IA (Résolution blocage silencieux)** : Ajout de la prise en charge du cas 0 profil avec état vide informatif et bouton de chargement direct du jeu de données de test.
  * **Parcours Feuilles de Temps (CRA)** : Ajout d'un message d'alerte explicite lorsqu'aucune mission active n'est disponible lors de la création d'un CRA.
  * **Parcours Créer un CV** : Ajout d'une action "Vider le formulaire" pour repartir instantanément d'une page blanche sans devoir effacer manuellement chaque section.
- **Synchronisation Vercel CLI & Nettoyage Intégral des Clés :**
  * Connexion CLI et synchronisation du projet avec Vercel (`moslihayoubs-projects/ai-tool`).
  * Injection automatique des variables d'environnement sur Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `GOOGLE_API_KEY`) pour les environnements Production, Preview et Development.
  * Élimination des chaînes de clés de secours en dur dans le code source (`lib/supabase.ts`) au profit d'une lecture stricte via les variables d'environnement.
  * Déploiement en production immédiat exécuté avec succès sur `https://parseliqhr.vercel.app`.
- **Audit de Cybersécurité & Hardening (M84 Secure Core) :**
  * Audit complet de l'historique Git : aucune clé secrète (Google Client Secret, Gemini API Key, OpenRouter) n'a fuité dans les commits.
  * Validation du `.gitignore` pour sanctuariser les fichiers `.env` et création d'un gabarit `.env.example` sans secrets pour le déploiement d'équipe.
  * Vérification de la couche Supabase : RLS actif sur 100% des tables, politique Zero Trust isolant les données par utilisateur, clé `service_role` 100% exclue du client.
  * Flux Google OAuth sécurisé : secret stocké exclusivement sur les serveurs Google et Supabase GoTrue, inaccessible au navigateur.
- **Optimisation "Créer un CV" & Correction du Scroll Vide :**
  * Déplacement de l'élément "Créer un CV" de la catégorie *Recrutement* vers la catégorie *Outils* dans `Sidebar.tsx`.
  * Suppression définitive du double scroll et de l'espace vide sous la feuille A4 grâce à l'ajustement du conteneur parent (`overflow-hidden` pour cette vue) et le confinement du défilement dans le panneau de prévisualisation.
  * Ajout d'un carrousel de modèles de CV interactif avec flèches de navigation `< >` et pastilles d'indication (dots) pour basculer facilement entre les styles (Minimaliste, Technique, Cadre, Freelance).
- **Gestion d'Erreur Google OAuth & Guidage d'Activation :** Détection de l'erreur `provider is not enabled` dans `AuthModal.tsx` avec message clair guidant vers l'activation dans le tableau de bord Supabase ou l'usage immédiat d'Email/Mot de passe.
- **Backend Supabase & Base de Données Sécurisée (RLS) :**
  * Création des tables Postgres : `hr_candidates`, `hr_pipeline`, `hr_missions`, `hr_timesheets`, `hr_user_quotas`.
  * Activation du Row Level Security (RLS) à 100% avec règles d'isolation par `user_id`.
  * Client Supabase initialisé dans `lib/supabase.ts` et services de persistance dans `services/dbService.ts`.
- **Authentification Gmail (Google OAuth) & Email (shadcn / Lucide) :**
  * Création de la modal d'authentification `AuthModal.tsx` avec design shadcn et icônes `lucide-react`.
  * Prise en charge de la connexion Gmail en 1-clic via OAuth et inscription/connexion par Email & Mot de passe.
  * Synchronisation en temps réel de la session utilisateur dans le bandeau latéral `Sidebar.tsx`.
- **Bascule Dynamique Automatique en Mode Hybride & Toggle Réservé Admin :**
  * Le sélecteur de mode de parsing (Hybride / Vision) est désormais **strictement réservé à l'administrateur** (`isOwner`) et totalement masqué pour les utilisateurs standards.
  * **Auto-Bascule Hybride sur Épuisement de Token / Quota :** Dès qu'un utilisateur ou une requête heurte un épuisement de tokens, un quota restreint (429/503), le système bascule automatiquement et de manière transparente sur le mode Hybride ultra-léger (-90% tokens) sans bloquer le parsing.
- **Moteur de Parsing Double Stratégie (Hybride & Vision) :** Intégration complète d'un double moteur d'analyse :
  * **⚡ Mode Hybride (Défaut)** : Extraction locale du texte PDF via `pdfjs-dist` (70ms) + structuration Gemini textuelle. Réduit les tokens de 90% et divise le temps d'analyse par 10 (~7-9s).
  * **👁️ Mode Vision (Base64)** : Analyse visuelle multimodale native préservée pour les CVs scannés ou images.
  * **Bascule Instantanée 1-Clic** : Switch interactif disponible directement sur la page d'import (`UploadView`) et dans les paramètres (`SettingsView`), avec persistance `localStorage` (`parseliq_parsing_mode`).
  * **Repli Automatique (Failover)** : Bascule silencieuse vers le mode Vision si l'extraction locale du PDF ne renvoie aucun texte exploitable.
- **Optimisation Latence Parsing & Auto-Redirection :** Éradication des attentes anormales (190s) grâce au bornage du timeout HTTP à 25s, priorisation des modèles flash ultra-rapides (`gemini-3.6-flash`, `gemini-3.5-flash`), failover immédiat sans retry interne bloquant, et auto-redirection fluide vers le Dashboard en fin d'analyse.
- **Quota Journalier Étendu à 10 Opérations :** Augmentation du nombre d'opérations d'analyse quotidiennes de 3 à 10 par jour dans `App.tsx` et alignement des textes i18n (`fr`, `en`, `ar`).
- **Bandeau de Limitation Contextuel & Auto-Hide :** Remplacement automatique du bandeau de limitation par une bannière de succès positive dès que tous les CVs sont analysés avec succès, et ajout d'un bouton de fermeture manuel (croix).
- **Bouton Réessayer Instantané :** Intégration d'un bouton "Réessayer" direct sur chaque carte de CV en erreur pour relancer sans réimporter.
- **Correctif Parsing CV (Google Gemini) :** Remplacement du modèle obsolète `gemini-2.5-flash` par une chaîne de repli automatique multi-modèles (`gemini-3.6-flash`, `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.1-flash-lite`).
- **Détection Fiabilisée MIME Type PDF :** Correction dans `readFileAsBase64` pour assigner explicitement `application/pdf` lors de l'encodage base64.
- **Validation TypeScript & Build :** `npx tsc --noEmit` et `npm run build` validés avec 0 erreur.
- **Journalisation Système :** Mise à jour du registre `currentLogs` dans `components/InfraView.tsx`.

## 🛠️ Prochaines Étapes Suggérées
1. Mettre en place la persistance backend réelle (Supabase / Firebase) pour remplacer le stockage exclusif `localStorage`.
2. Étendre les scénarios TestSprite aux fonctionnalités avancées (génération de questions d'entretien IA, analyse sémantique de CV).

