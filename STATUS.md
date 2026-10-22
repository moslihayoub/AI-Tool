# 📊 Statut du Projet - Ai-Tool

## Dernière Mise à Jour
- **Date:** 22 Octobre 2026
- **Environnement:** Localhost (Port 5180) & Production (Déploiement Vercel via GitHub)
- **Branche:** `main`

## 🚀 Progrès Récents
- **Correctif Parsing CV (Google Gemini) :** Remplacement du modèle obsolète `gemini-2.5-flash` (rejeté 404 par Google) par une chaîne de repli automatique multi-modèles (`gemini-3.6-flash`, `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.1-flash-lite`) dans `services/geminiService.ts`.
- **Détection Fiabilisée MIME Type PDF :** Correction dans `readFileAsBase64` pour assigner explicitement `application/pdf` lors de l'encodage base64 de fichiers PDF avec MIME absent ou binaire brut.
- **Affichage Réel des Erreurs d'Upload :** Amélioration de `UploadView.tsx` pour afficher le message d'erreur technique précis renvoyé par l'IA plutôt qu'un message générique bloquant.
- **Mode Démo & Résolution du Zero-Data Trap :** Prise en charge du paramètre URL `?demo=true` pour précharger instantanément candidats, missions et feuilles de temps sur toute session vierge.
- **Validation TypeScript & Build :** `npx tsc --noEmit` et `npm run build` validés avec 0 erreur.
- **Journalisation Système :** Mise à jour du registre `currentLogs` dans `components/InfraView.tsx`.

## 🛠️ Prochaines Étapes Suggérées
1. Mettre en place la persistance backend réelle (Supabase / Firebase) pour remplacer le stockage exclusif `localStorage`.
2. Étendre les scénarios TestSprite aux fonctionnalités avancées (génération de questions d'entretien IA, analyse sémantique de CV).

