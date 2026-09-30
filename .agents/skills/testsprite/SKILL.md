---
name: testsprite
description: Guide d'intégration et d'utilisation de l'agent TestSprite pour l'automatisation des tests E2E, la génération de plans de test et l'assurance qualité autonome sous Google Antigravity.
---

# 🤖 TestSprite Agent & MCP Integration Skill

Ce guide décrit l'intégration, la configuration et l'exécution de l'agent **TestSprite** dans **Google Antigravity** via le **Model Context Protocol (MCP)**.

---

## 📌 Qu'est-ce que TestSprite ?

TestSprite est une plateforme et un agent IA de test autonome qui :
- Génère automatiquement des scénarios de test complets à partir des fonctionnalités du projet.
- Exécute les tests de bout en bout (E2E) dans des environnements sandbox sécurisés.
- Identifie les causes racines des régressions et bugs d'interface.
- Fournit aux agents de code (Antigravity) un rapport d'erreurs structuré pour auto-corriger les anomalies (*Self-Healing*).

---

## ⚙️ Configuration & Installation dans Antigravity

### 1. Configuration MCP (`~/.gemini/config/mcp_config.json`)
L'agent TestSprite communique avec Antigravity via le protocole MCP Stdio :

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["-y", "@testsprite/testsprite-mcp@latest"],
      "env": {
        "TESTSPRITE_API_KEY": "VOTRE_CLE_API"
      }
    }
  }
}
```

### 2. Utilisation en ligne de commande (CLI)
Pour lancer ou configurer TestSprite manuellement :

```bash
# Vérification et installation CLI
npx @testsprite/testsprite-cli --version

# Initialisation et configuration du projet
npx @testsprite/testsprite-cli setup
```

---

## 🧪 Workflow de Test Autonome (Antigravity + TestSprite)

1. **Phase 1 : Static & Build Check**
   - Validation statique TypeScript : `npx tsc --noEmit`
   - Build de production : `npm run build`

2. **Phase 2 : Exécution des tests via TestSprite Agent**
   - L'agent interroge les outils MCP TestSprite pour explorer l'interface de l'application (pages, formulaires, transitions).
   - Génération et validation des scénarios :
     - Importation et parsing de CV (Dropzone, URL).
     - Création manuelle et export de CV (PDF, DOC).
     - Gestion des recrutements (Kanban pipeline).
     - Gestion des Missions et Feuilles de temps (Timesheets).
     - Calculs financiers et intégrité des données.

3. **Phase 3 : Boucle de rétroaction (Self-Healing)**
   - En cas d'erreur ou d'échec détecté par TestSprite, l'agent Antigravity reçoit le diagnostic précis et applique le correctif directement.
   - Les modifications sont consignées dans `components/InfraView.tsx` (`currentLogs`).
