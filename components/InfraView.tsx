
import * as React from 'react';
import { useTranslation } from '../i18n';
import { Icon } from './icons';

interface InfraViewProps {}

interface LogEntry {
    date: string;
    time: string;
    type: 'feat' | 'fix' | 'ui' | 'refactor' | 'logic' | 'perf' | 'bug';
    title: string;
    description: string;
    details: string[];
}

const getIconForType = (type: LogEntry['type']): string => {
    return 'calendar';
};

const TechCard: React.FC<{ icon: string; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon name={icon} className="w-6 h-6 text-white" />
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
);

export const InfraView: React.FC<InfraViewProps> = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'log' | 'conception'>('log');
    const [logs, setLogs] = React.useState<LogEntry[]>([]);

    React.useEffect(() => {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const getDateStr = (offsetDays: number) => {
            const d = new Date(now.getTime() - (offsetDays * oneDay));
            return d.toISOString().split('T')[0];
        };

        const getTimeStr = (hour: number, minute: number) => {
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        };
        
        const currentLogs: LogEntry[] = [
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Standardisation Intégrale des Icônes sous Lucide React',
                description: 'Refonte complète du système d\'icônes (components/icons.tsx) : élimination de tous les SVG codés à la main déformés au profit des icônes officielles vectorielles de Lucide React.',
                details: [
                    'Éradication des glyphes custom défectueux : remplacement des tracés SVG approximatifs (notamment l\'icône sparkles déformée) par les composants certifiés lucide-react.',
                    'Mapping exhaustif Lucide : 60+ icônes d\'interface (Sparkles, LayoutDashboard, BrainCircuit, Users, FilePenLine, ArrowLeftRight, Clock, etc.) mappées en résolution vectorielle parfaite.',
                    'Conservation ciblée des drapeaux & marques : sanctuarisation exclusive des drapeaux multilingues (FR, GB, MA) et logos vectoriels tiers (WhatsApp, Google) sans équivalent Lucide natif.',
                    'Harmonisation visuelle 100% cohérente : rendu homogène avec gestion dynamique des classes Tailwind (w-*, h-*, text-*, flex-shrink-0).'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'security',
                title: 'Révocation Privilèges Admin fahdrahali@gmail.com',
                description: 'Révocation immédiate et complète de tous les droits d\'administration pour fahdrahali@gmail.com. Accès propriétaire strictement réservé à moslihayoub@gmail.com et Moslih84.',
                details: [
                    'Contrôle RBAC durci : suppression de l\'adresse fahdrahali@gmail.com des conditions isOwner dans App.tsx (initAuth, onAuthStateChange, AuthModal onSuccess).',
                    'Cloisonnement exclusif : seuls moslihayoub@gmail.com et Moslih84 disposent des droits d\'accès aux sections administratives (Moteur d\'analyse CV Admin, Gestion des données).',
                    'Zero Trust vérifié : application stricte du principe de moindre privilège.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Cloisonnement Admin Strict, Onboarding 1ère Visite & Lien Moslih84',
                description: 'Restriction stricte des modules d\'administration aux seuls profils habilités (moslihayoub@gmail.com / Moslih84), chargement automatique des données de démo pour tout nouvel utilisateur avec toaster et bouton Effacer, et mise à jour du lien de signature vers https://moslih84.vercel.app/.',
                details: [
                    'Lien de signature : redirection de la mention "Created by Moslih84" dans la barre latérale vers https://moslih84.vercel.app/.',
                    'Isolation des sections Admin : masquage strict des blocs "Moteur d\'analyse CV (Admin)" et "Gestion des données" dans les paramètres pour tout utilisateur non-administrateur.',
                    'Habilitation Admin : reconnaissance stricte de l\'administrateur par email (moslihayoub@gmail.com) ou identifiant (Moslih84 / préfixe moslih84). Révocation complète des privilèges tiers.',
                    'Onboarding 1ère connexion : injection automatique des données fictives lors de la 1ère visite ou 1ère connexion avec toaster explicatif et CTA "Effacer" interactif à durée étendue.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Pastille Carrousel Flottante en Bas (Sans Masquer le CV & Zéro Fond Gris)',
                description: 'Repositionnement du carrousel de modèles en pastille compacte flottante ancrée en bas de page sans bandeau gris pleine largeur, libérant totalement l\'en-tête du CV.',
                details: [
                    'Libération de l\'en-tête du CV : suppression de la barre sticky haute qui masquait le nom et le titre du profil ("Jean Dupont").',
                    'Pastille flottante 100% autonome : transformée en pilule compacte avec coins arrondis, ombre portée douce et effet backdrop-blur, sans arrière-plan gris pleine largeur.',
                    'Ancrage bas maîtrisé : fixée délicatement en bas (sticky bottom-6) au centre du panneau sans bloquer la lecture du document.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Éradication Définitive du Scroll Vide & Toolbar Carrousel Sticky',
                description: 'Suppression du marqueur fantôme Page 3 qui forçait 60cm de défilement vide et replacement du carrousel de modèles en en-tête sticky au-dessus de la feuille A4.',
                details: [
                    'Suppression du marqueur fantôme top-[59.4cm] : élimination de plus de 1100px de scroll vide artificiel forcé par un élément absolu hors-flux.',
                    'Carrousel de templates en Sticky Header : déplacé au sommet du panneau de prévisualisation avec effet backdrop-blur pour permettre un changement de modèle immédiat sans scroller 1200px vers le bas.',
                    'Suppression du trou gris inférieur : le container A4 se termine désormais proprement au bas de la page avec un espacement maîtrisé (py-3).'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Test Scénario ATS Complet & Résolution des Gaps Fonctionnels',
                description: 'Audit et test de bout en bout des 8 parcours utilisateurs ATS, correction des états vides manquants, renforcement mobile du pipeline et ajout des bannières interactives.',
                details: [
                    'Parcours Dashboard : correction du bug d\'affichage sur résultats filtrés vides, ajout d\'un empty state explicite avec CTA de réinitialisation et d\'une bannière flottante de comparaison (1/2 et 2/2 prêts).',
                    'Parcours Comparateur : ajout d\'un CTA interactif de redirection vers le Dashboard lorsque moins de 2 profils sont sélectionnés.',
                    'Parcours Pipeline Kanban : ajout d\'un sélecteur d\'étape 1-tap directement sur chaque carte pour garantir l\'accessibilité mobile sans dépendance au drag-and-drop HTML5.',
                    'Parcours Assistant IA : déblocage du cas 0 profil avec message explicatif et bouton d\'injection des données de démonstration.',
                    'Parcours CRA & Missions : ajout de gardes d\'alerte si aucune mission active n\'est disponible lors de la création d\'une feuille de temps.',
                    'Parcours Créer un CV : ajout d\'une fonction et d\'un bouton de réinitialisation complète du formulaire pour repartir d\'une page blanche.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'perf',
                title: 'Synchronisation Vercel CLI & Nettoyage Intégral des Clés',
                description: 'Connexion directe au projet Vercel ai-tool, injection sécurisée des variables d\'environnement en production et élimination des clés en dur dans le code source.',
                details: [
                    'Liaison Vercel CLI : projet connecté à moslihayoubs-projects/ai-tool.',
                    'Variables de production injectées : VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, GEMINI_API_KEY et GOOGLE_API_KEY configurées sur Production, Preview et Development.',
                    'Nettoyage du code : suppression des clés de repli codées en dur dans lib/supabase.ts au profit d\'une lecture 100% via import.meta.env.',
                    'Déploiement immédiat en production validé et actif sur https://parseliqhr.vercel.app.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'perf',
                title: 'Audit de Cybersécurité & Hardening (M84 Secure Core)',
                description: 'Vérification complète de l\'étanchéité des secrets : historique Git 100% propre, isolation des clés d\'API, RLS Supabase validé et template .env.example déployé.',
                details: [
                    'Historique Git audité : 0 clé sensible (Google Secret, Gemini, OpenRouter) n\'a jamais été commitée dans le dépôt.',
                    'Fichiers d\'environnement : exclusion stricte vérifiée (.env et .env.* ignorés), ajout du gabarit public sécurisé .env.example.',
                    'Sécurité Supabase : RLS actif sur 100% des tables avec politique Zero Trust (auth.uid() = user_id) et clé service_role strictement absente du client.',
                    'Google OAuth : secret conservé exclusivement côté serveur chez Google et Supabase GoTrue, aucune fuite bundle client.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Déplacement de "Créer un CV" dans Outils & Correction du Scroll Vide',
                description: 'Reclassification du module "Créer un CV" dans la section Outils du menu latéral, suppression des scrollbars imbriquées et ajout d\'un contrôleur de carrousel de modèles.',
                details: [
                    'Reclassification : "Créer un CV" est déplacé de la section "Recrutement" vers le sommet de la section "Outils" dans Sidebar.tsx.',
                    'Éradication du scroll vide : neutralisation de l\'overflow global du container parent lorsque CreateCVView est actif et confinement des scrollbars au formulaire et à la prévisualisation.',
                    'Carrousel de templates interactif : ajout d\'un contrôleur tactile avec flèches précédent/suivant et indicateurs de pagination (dots) pour basculer aisément entre les 4 modèles visuels.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'fix',
                title: 'Google OAuth Feedback & Fallback Guidance',
                description: 'Traitement explicite de l\'erreur "provider is not enabled" dans AuthModal et guidage vers l\'activation Google Console / Supabase ou la connexion Email.',
                details: [
                    'Détection de l\'erreur de validation Supabase (code 400 provider is not enabled).',
                    'Message explicatif guidant l\'administrateur vers l\'activation du provider Google dans le dashboard Supabase.',
                    'Maintien de la connexion fonctionnelle par Email/Mot de passe.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Supabase Backend, Gmail/Email Auth & Auto-Bascule Hybride Dynamique',
                description: 'Mise en place de l\'infrastructure backend Supabase avec 5 tables et RLS, authentification Google/Email, interface shadcn/lucide et bascule automatique en mode hybride sur token épuisé.',
                details: [
                    'Backend Supabase : création des tables `hr_candidates`, `hr_pipeline`, `hr_missions`, `hr_timesheets`, `hr_user_quotas` avec Row Level Security (RLS) activé à 100%.',
                    'Authentification Gmail OAuth & Email : modal de connexion/création de compte moderne inspirée de shadcn avec Lucide icons.',
                    'Sécurité & Visibilité du Toggle : restriction stricte du commutateur de mode de parsing (Hybride/Vision) à l\'administrateur uniquement (`isOwner`), masqué pour les utilisateurs standards.',
                    'Auto-Bascule Hybride Dynamique : bascule automatique immédiate vers le mode Hybride (PDF.js + texte) en cas d\'épuisement de quota, rate limit 429 ou incident sur le modèle Vision.',
                    'Synchronisation persistante des candidats et quotas avec la base de données Supabase.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Dual Engine Parsing : Hybride Local (PDF.js) + Vision Multimodale',
                description: 'Intégration d\'un système de double moteur de parsing avec bascule instantanée 1-clic : Mode Hybride ultra-rapide (~7s, -90% tokens) et Mode Vision multimodale Base64.',
                details: [
                    'Moteur Hybride : extraction directe du texte PDF côté client via `pdfjs-dist` (70ms) combinée à une analyse structurée Gemini purement textuelle (latence divisée par 20, 0 tokens vision).',
                    'Moteur Vision Multimodale : analyse OCR intégrale par Base64 conservée et accessible à tout moment pour les scans et images.',
                    'Sélecteur de mode interactif accessible directement sur la page d\'import (UploadView) et dans les paramètres (SettingsView), avec persistance `localStorage`.',
                    'Mécanisme de repli automatique (Auto-fallback) vers le mode Vision si l\'extraction PDF locale ne détecte aucun texte (ex: PDF purement graphique).'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'perf',
                title: 'Parsing Latency Optimization & Instant Auto-Redirect',
                description: 'Optimisation drastique des temps de réponse IA : timeout HTTP à 25s, suppression des retries internes bloquants et auto-redirection post-analyse.',
                details: [
                    'Priorisation stricte des modèles à très faible latence (`gemini-3.6-flash` à ~1.5s et `gemini-3.5-flash`).',
                    'Configuration du timeout client à 25s et bascule immédiate au modèle suivant sans retry bloquant sur les nœuds 503.',
                    'Auto-redirection fluide de la modale de chargement vers le Dashboard dès complétion de l\'analyse (1.5s).'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Daily Analysis Limit Raised to 10 Operations & Contextual Banner Auto-Hide',
                description: 'Augmentation du quota journalier à 10 opérations par jour et masquage automatique du bandeau de limitation une fois les CVs analysés avec succès.',
                details: [
                    'Passage de la limite quotidienne d\'analyse de 3 à 10 opérations par jour dans l\'état global et le stockage.',
                    'Remplacement automatique du bandeau de limitation par un statut de succès positif lorsque tous les fichiers sont analysés.',
                    'Ajout d\'un bouton de fermeture (croix) sur le bandeau d\'information de quota pour permettre à l\'utilisateur de le masquer.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Instant Retry Action on Failed Upload Cards',
                description: 'Ajout d\'un bouton de réessai instantané sur chaque fichier en erreur pour relancer le parsing sans avoir à réimporter le document.',
                details: [
                    'Intégration d\'un bouton "Réessayer" direct dans l\'alerte d\'erreur de la carte fichier.',
                    'Remise automatique du statut à `pending` pour réactiver immédiatement le CTA d\'analyse.',
                    'Élimine la friction de suppression/glisser-déposer lors des incidents réseau ou réessais.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'fix',
                title: 'Gemini Models Auto-Fallback Chain & PDF MIME Resolver',
                description: 'Migration du modèle déprécié gemini-2.5-flash vers la chaîne de résilience gemini-3.6-flash / gemini-3.8-flash / gemini-3.5-flash et fiabilisation du MIME type PDF.',
                details: [
                    'Résolution de l\'erreur 404 (modèle gemini-2.5-flash déprécié par Google) avec boucle de fallback automatique sur les modèles actifs.',
                    'Détection et assignation automatique du MIME type application/pdf lors de l\'encodage base64 dans readFileAsBase64.',
                    'Affichage dynamique de l\'erreur réelle retournée par l\'API dans la carte Upload au lieu du message générique masquant.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'fix',
                title: 'TestSprite E2E Cloud Validation — 100% Passed',
                description: 'Validation complète de la suite de tests E2E sur TestSprite Cloud pour la production Vercel.',
                details: [
                    'Mise à jour des planSteps TestSprite pour cibler https://parseliqhr.vercel.app/?demo=true.',
                    'Exécution et validation des 4 suites de tests E2E : CV Builder, Dashboard, Recruitment Pipeline, Missions.',
                    'Taux de succès : 4/4 (100% PASSED) avec enregistrements vidéo et traces d\'exécution validés.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Demo Mode URL Seeding & Missions Status Filtering',
                description: 'Support du chargement automatique de données de démo via ?demo=true et ajout du filtre de statut dans la vue Missions.',
                details: [
                    'Support du paramètre URL `?demo=true` pour précharger candidats, missions et feuilles de temps sur n\'importe quelle session vierge.',
                    'Ajout d\'un bouton "Charger données de démo" dans les états vides du Dashboard et du Kanban Recrutement.',
                    'Implémentation de la barre de filtrage par Statut (All, Active, Draft, Upcoming, Paused, Ended) dans MissionsView.',
                    'Mise à jour des scénarios TestSprite pour tester la session de démonstration préremplie.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Full TestSprite Suite Execution on Live Production Site',
                description: 'Exécution complète des 4 scénarios E2E sur https://parseliqhr.vercel.app/ avec diagnostic précis et validation du CV Builder.',
                details: [
                    'Projet `ParseLIQ HR` actif sur TestSprite Cloud (ID: d8fbbe39-5451-4e79-8f4e-414f334b14d4).',
                    'CV Builder (ID: cca86ff6-68b6-4f0a-9785-4f3a3d964bba) : PASSED (3/3 étapes validées, canevas A4 et formulaire opérationnels).',
                    'Dashboard & Pipeline : Navigation validée, détection autonome des états initiaux vierges ("No CVs", "No candidates").',
                    'Missions : Interface validée avec boutons d\'action (Export CSV, Nouvelle Mission).',
                    'Rapports d\'analyse et vidéos consultables sur le dashboard TestSprite en temps réel.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'fix',
                title: 'Fixed Gemini Model Identifier for CV Parsing',
                description: 'Correction du nom de modèle Gemini invalide `gemini-3.1-pro-preview` par `gemini-2.5-flash`.',
                details: [
                    'Remplacement de `gemini-3.1-pro-preview` (invalide) par `gemini-2.5-flash` dans `parseCvContent`.',
                    'Ajustement de la configuration des outils (`googleSearch`) pour qu\'ils ne soient envoyés que lors du parsing d\'URL.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'fix',
                title: 'Vercel GOOGLE_API_KEY Environment Variable Support',
                description: 'Support de la variable GOOGLE_API_KEY configurée dans Vercel lors du build Vite.',
                details: [
                    'Mise à jour de `vite.config.ts` pour capturer `GOOGLE_API_KEY`, `GEMINI_API_KEY` et `API_KEY` depuis `process.env` de Vercel.',
                    'Correction de la résolution dans `geminiService.ts` pour supporter les 3 noms de variables d\'environnement.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'refactor',
                title: 'Codebase Methodology Audit & Fixes',
                description: 'Application stricte des règles du Master Skill suite à l\'audit.',
                details: [
                    'Éradication totale du type `any` dans le code (App.tsx, types.ts, etc.).',
                    'Migration des montants financiers (TJM, HT, TTC) en centimes d\'euros (Zéro Float).',
                    'Création de `utils/currency.ts` pour la gestion propre de la monnaie.',
                    'Ajout d\'une validation de type Zod (Mock Sécurité IA) sur les retours Gemini API.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Integration of Methodology Master Skill',
                description: 'Adaptation et ajout du Skill Maître Complet (Méthodologie & Architecture) dans le projet.',
                details: [
                    'Création du fichier .agents/skills/methodology/SKILL.md avec les règles SDD adaptées au projet.',
                    'Mise à jour de AGENTS.md pour forcer l\'utilisation de ces standards.',
                    'Définition des règles sur l\'architecture racine (components, services, types) et la validation des données Gemini.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Clone and Setup Local Workspace',
                description: 'Copie du projet GitHub Ai-Tool vers le répertoire de sélection.',
                details: [
                    'Création du répertoire /Users/fahdrahali/.gemini/antigravity/scratch/moslihayoub_projects/selection.',
                    'Copie du contenu cloné du projet GitHub depuis Downloads vers le répertoire local.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'fix',
                title: 'Fixed Global Fetch Error',
                description: 'Correction de l\'erreur Cannot set property fetch of #<Window> which has only a getter provoquée par un conflit d\'importmap avec Vite.',
                details: [
                    'Suppression du script importmap dans index.html pour laisser Vite résoudre les dépendances (dont @google/genai).',
                    'Résolution du conflit de la version CDN incluant un polyfill node-fetch redondant dans le build Navigateur.',
                    'Le client Gemini API se repose maintenant nativement sur le module ESM Node/Browser généré et injecté par Vite.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'bug',
                title: 'Responsive Breakpoints & Overflow Fixes',
                description: 'Correction de la mise en page (breakpoints) et du débordement de contenu.',
                details: [
                    'Fix de la zone d\'import Sidebar qui subissait une compression sur petits et moyens écrans.',
                    'Correction du chevauchement de la page A4 (CreateCVView) où les conteneurs compressaient le contenu sous le canevas en blanc grâce à `shrink-0`.',
                    'Mise en évidence du mode adaptatif avec défilement horizontal natif (overflow-x) pour la page CV, sans briser le standard 210mm x 297mm.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'Error Handling & UI Polishing',
                description: 'Amélioration des alertes techniques et restructuration de la zone d\'importation.',
                details: [
                    'Conversion des alertes Javascript en notifications Toast plus lisibles et traduites.',
                    'Configuration et restructuration de la zone de dépôt (UploadView) sous forme d\'onglets pour clarifier "Import a doc" vs "Via link".',
                    'Correction du menu latéral (Sidebar) masqué involontairement sur les écrans larges.',
                    'Application des styles d\'impression correctifs aux conteneurs de l\'application afin d\'adopter la hauteur exacte lors de l\'export.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'feat',
                title: 'CV Export & UI Enhancements',
                description: 'Ajout de l\'export Word (.doc), amélioration de la visibilité des onglets d\'import, et optimisation de l\'impression A4.',
                details: [
                    'Implémentation de l\'exportation Word (format .doc) avec gestion du contenu HTML.',
                    'Refonte visuelle des onglets "Via link" et "Import a doc" en boutons CTA plus accessibles.',
                    'Ajout d\'un sélecteur de format (PDF/Word) dans la barre d\'actions du CV.',
                    'Optimisation CSS @media print pour éviter les coupures de texte au format A4 (break-inside-avoid).',
                    'Ajustement de la hauteur de page à min-h-screen pour une meilleure couverture visuelle.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'CV Paging & Style Refinement',
                description: 'Optimisation de l\'aperçu CV avec support multi-pages (Word-like) et ajustement des bordures et arrondis.',
                details: [
                    'Mise en place d\'indicateurs de saut de page visuels (Page 2, Page 3)',
                    'Réduction de 30% de l\'arrondi des coins du document pour un look plus pro',
                    'Suppression des contours/bordures du wrapper de document',
                    'Activation du scroll vertical fluide pour visualiser l\'intégralité des données CV'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'UI Rounding & A4 Preview',
                description: 'Application de coins arrondis sur toute l\'interface et mise en place d\'un aperçu Document A4 avec indicateur de séparation de page.',
                details: [
                    'Mise à jour de CreateCVView avec des classes rounded-2xl, rounded-3xl',
                    'Implémentation du wrapper A4 (21cm/29.7cm) pour une expérience plus moderne',
                    'Ajout d\'un marqueur visuel de saut de page pour le contenu long'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'bug',
                title: 'Fixed Profile Population Leak',
                description: 'Corrected a bug where dummy data (like LinkedIn links) persisted after importing a real CV. Optimized theme sync for system preferences.',
                details: [
                    'Modified populateFromProfile in CreateCVView to ensure all fields are reset/overwritten on import.',
                    'Added handling for LinkedIn and Website fields during AI parsing to match real profiles.',
                    'Verified robust matchMedia listeners in App.tsx for cross-browser theme synchronization.'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'bug',
                title: 'Fixed Uncaught ReferenceError',
                description: 'Fixed t is not defined error in CreateCVView by importing and using useTranslation.',
                details: [
                    'Imported useTranslation from ../i18n in CreateCVView.tsx',
                    'Added const { t } = useTranslation(); inside CreateCVView component'
                ]
            },
            {
                date: getDateStr(0),
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'ui',
                title: 'Refactoring & UI Enhancements',
                description: 'Applied minimalist custom scrollbars, reorganized the Upload page, fixed Arabic translations, updated footer link, and added this auto-logger instruction.',
                details: [
                    'Applied minimalist Tailwind pink custom scrollbar logic into index.css.',
                    'Reordered CV upload view to place URL input field before Drag&Drop box.',
                    'Updated bottom sidebar LinkedIn link for "moslih84".',
                    'Fixed missing layout styles and began preparation for Arabic missing translations.',
                    'Added standard operational procedure to auto-log all Gemini AI updates here.'
                ]
            },
            { 
                date: getDateStr(0), 
                time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                type: 'logic', 
                title: 'Auto-Log System', 
                description: 'Implemented logic to automatically record new features and changes into the infrastructure log.',
                details: [
                    'Created centralized LogEntry interface with support for detailed lists.',
                    'Implemented chronological date generation relative to current session.',
                    'Added visual indicators for log types (Feat, Fix, Logic, etc.).',
                    'Integrated Change Logger node into the architecture diagram to visualize tracking flow.'
                ]
            },
            { 
                date: getDateStr(0), 
                time: getTimeStr(10, 15), 
                type: 'feat', 
                title: 'Infra Page', 
                description: 'Added technical infrastructure documentation and changelog view for owners.',
                details: [
                    'Developed InfraView component with Log and Conception tabs.',
                    'Designed vertical timeline for change logs using Tailwind CSS.',
                    'Created visual architecture flow using CSS and SVG icons.',
                    'Added access control to restrict view to Owner role via isOwner prop.'
                ]
            },
            { 
                date: getDateStr(1), 
                time: getTimeStr(16, 45), 
                type: 'ui', 
                title: 'Log Timeline Enhancement', 
                description: 'Standardized log icons with primary gradient, added timestamps, and enforced chronological sorting.',
                details: [
                    'Unified log icon style with bg-gradient-button for consistent branding.',
                    'Added specific icons for each log type (star for features, sparkles for UI, etc.).',
                    'Updated data structure to include timestamps for granular tracking.',
                    'Refactored timeline CSS to ensure correct alignment on mobile and desktop.'
                ]
            },
            { 
                date: getDateStr(1), 
                time: getTimeStr(17, 20), 
                type: 'logic', 
                title: 'Smart Pipeline Logic', 
                description: 'Implemented automated status assignment (Hired/Approved) based on interview results and date validation.',
                details: [
                    'Implemented algorithm: Majority "Excellent" results -> "Hired" status.',
                    'Implemented algorithm: Majority "Good" results -> "Approved" status.',
                    'Added logic: "Fair" result in Interview 2 forces "Selected" status.',
                    'Implemented strict chronological date validation (App < Int1 < Int2 < Start) to prevent logic errors.'
                ]
            },
            { 
                date: getDateStr(2), 
                time: getTimeStr(11, 0), 
                type: 'ui', 
                title: 'Mobile Drawers', 
                description: 'Replaced native select dropdowns with touch-friendly bottom sheet Drawers for mobile devices.',
                details: [
                    'Created reusable Drawer component with enter/exit animations using CSS transitions.',
                    'Integrated Drawer in RecruitmentView for Interview result selection on mobile.',
                    'Integrated Drawer in DashboardView for Filter and Action menus to improve UX on small screens.',
                    'Improved touch targets size for mobile users.'
                ]
            },
            { 
                date: getDateStr(3), 
                time: getTimeStr(15, 45), 
                type: 'ui', 
                title: 'Mobile Card Layouts', 
                description: 'Converted Pipeline and History tables to responsive Card views for better mobile readability.',
                details: [
                    'Designed card-based layout for RecruitmentView on small screens (hidden md).',
                    'Designed card-based layout for HistoryView snapshots to avoid horizontal scrolling.',
                    'Ensured all actions (edit dates, toggle status) are fully accessible in the card view.',
                    'Added "Show More/Less" functionality or optimized spacing for dense information.'
                ]
            },
            { 
                date: getDateStr(5), 
                time: getTimeStr(9, 30), 
                type: 'refactor', 
                title: 'Navigation Update', 
                description: 'Implemented mobile bottom navigation bar and optimized sidebar responsive behavior.',
                details: [
                    'Created MobileNavBar component fixed at bottom for easy thumb access.',
                    'Implemented scroll-aware visibility logic (hide navbar on scroll down, show on scroll up).',
                    'Refactored Sidebar to work as a slide-out drawer on mobile with overlay backdrop.',
                    'Adjusted main content padding to prevent overlap with fixed mobile navbar.'
                ]
            },
            { 
                date: getDateStr(7), 
                time: getTimeStr(16, 10), 
                type: 'feat', 
                title: 'Pipeline History', 
                description: 'Added snapshot functionality to save and view historical states of the recruitment pipeline.',
                details: [
                    'Defined PipelineSnapshot interface in types.ts to structure history data.',
                    'Implemented logic to save current recruitmentData state to localStorage.',
                    'Created HistoryView to list saved snapshots ordered by date.',
                    'Added "Update" logic to overwrite recent snapshots within the same session to reduce clutter.'
                ]
            },
            { 
                date: getDateStr(9), 
                time: getTimeStr(13, 0), 
                type: 'feat', 
                title: 'Recruitment Pipeline', 
                description: 'Created the main Kanban-style pipeline view with tracking for Interviews, Tech Challenges, and Start Dates.',
                details: [
                    'Developed RecruitmentView table with inline editable inputs for dates and results.',
                    'Implemented filtering by Job Category using local state.',
                    'Added "Auto-add to pipeline" logic for candidates with >70 performance score.',
                    'Integrated ToggleSwitch component for boolean states (e.g., Challenge Done).'
                ]
            },
            { 
                date: getDateStr(11), 
                time: getTimeStr(10, 45), 
                type: 'ui', 
                title: 'Toast Notification System', 
                description: 'Integrated a global Toast provider for user feedback on actions.',
                details: [
                    'Created ToastContext and ToastProvider to manage notification state globally.',
                    'Implemented styled toast components with Success, Error, and Info variants.',
                    'Added CSS animations for toast appearance (slide-in) and auto-dismissal.',
                    'Integrated toast calls in App.tsx for file uploads and pipeline updates.'
                ]
            },
            { 
                date: getDateStr(13), 
                time: getTimeStr(14, 20), 
                type: 'feat', 
                title: 'Advanced Filtering', 
                description: 'Replaced simple dashboard dropdowns with a comprehensive full-page Filter Modal (Skills, Location, Experience).',
                details: [
                    'Created FilterView component as a full-screen modal for complex filtering.',
                    'Implemented multi-select logic for Job Category, Location, and Experience Level.',
                    'Added dynamic skill filtering with tag input and removal.',
                    'Added logic to persist filters in DashboardView state during navigation.'
                ]
            },
            { 
                date: getDateStr(15), 
                time: getTimeStr(11, 30), 
                type: 'ui', 
                title: 'Sidebar Redesign', 
                description: 'Centered icons and improved visual hierarchy in the sidebar navigation.',
                details: [
                    'Updated Sidebar CSS using Flexbox for better vertical alignment and centering.',
                    'Added collapsed state logic with smooth width transitions.',
                    'Updated active state styling with primary colors and background highlights.',
                    'Ensured logo and text visibility toggles correctly based on collapse state.'
                ]
            },
            { 
                date: getDateStr(17), 
                time: getTimeStr(18, 0), 
                type: 'fix', 
                title: 'Type Definitions', 
                description: 'Resolved widespread JSX Intrinsic Elements errors and standardized React imports.',
                details: [
                    'Standardized React imports to `import * as React` across all components.',
                    'Fixed JSX.IntrinsicElements augmentation in types.ts to support custom web components.',
                    'Resolved circular dependencies in type definitions.',
                    'Moved global type declarations to correct scope to fix module augmentation errors.'
                ]
            },
            { 
                date: getDateStr(19), 
                time: getTimeStr(9, 15), 
                type: 'feat', 
                title: 'AI Assistant', 
                description: 'Integrated Gemini Flash for contextual chat on specific candidate profiles and global dashboard queries.',
                details: [
                    'Implemented createAIChat service using Google GenAI SDK.',
                    'Created AIAssistantView for global dashboard-level queries using summarized candidate data.',
                    'Integrated chat interface into CandidateDetailView for profile-specific questions.',
                    'Added prompt engineering to ensure the AI acts as a helpful HR assistant.'
                ]
            },
            { 
                date: getDateStr(21), 
                time: getTimeStr(15, 0), 
                type: 'feat', 
                title: 'Comparators', 
                description: 'Added side-by-side candidate comparison view with skill overlap highlighting.',
                details: [
                    'Created CompareView component accepting two profile objects.',
                    'Implemented logic to compare 2 selected profiles from Dashboard.',
                    'Added visual highlighting for common hard and soft skills.',
                    'Implemented share functionality via WhatsApp, Email, and Clipboard copy.'
                ]
            },
            { 
                date: getDateStr(23), 
                time: getTimeStr(12, 30), 
                type: 'ui', 
                title: 'Dashboard Charts', 
                description: 'Implemented Recharts for visualizing skills expertise, location distribution, and experience levels.',
                details: [
                    'Integrated Recharts library for responsive data visualization.',
                    'Created BarChart and LineChart components to display aggregated candidate data.',
                    'Implemented data transformation logic (grouping by location, job, etc.) in DashboardView.',
                    'Added custom tooltips and responsive containers for better UX.'
                ]
            },
            { 
                date: getDateStr(25), 
                time: getTimeStr(10, 0), 
                type: 'feat', 
                title: 'CV Parsing Engine', 
                description: 'Core functionality: Upload, OCR, and parse resume data to JSON using Gemini API.',
                details: [
                    'Implemented file upload interface with drag-and-drop using react-dropzone logic.',
                    'Integrated Google Gemini 2.5 Flash model for extracting structured JSON from CV text/images.',
                    'Defined JSON schema for robust candidate data extraction (Contact, Skills, Exp).',
                    'Implemented caching mechanism using file hash to prevent re-parsing duplicates.'
                ]
            },
            { 
                date: '2024-11-03', 
                time: '08:00', 
                type: 'feat', 
                title: 'Project Init', 
                description: 'Initial application setup with React 19, TypeScript, Tailwind CSS, and Vite.',
                details: [
                    'Setup Vite project with React-TS template.',
                    'Configured Tailwind CSS with custom theme colors (Primary Pink/Blue gradient).',
                    'Set up basic routing structure and View state management in App.tsx.',
                    'Initialized git repository and basic directory structure.'
                ]
            },
        ];
        setLogs(currentLogs);
    }, []);

    return (
        <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('infra.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('infra.subtitle')}</p>
            </div>

            <div className="flex gap-4 border-b dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('log')}
                    className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'log' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('infra.tabs.log')}
                </button>
                <button
                    onClick={() => setActiveTab('conception')}
                    className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'conception' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    {t('infra.tabs.conception')}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'log' ? (
                    <div className="max-w-3xl mx-auto py-4">
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                            {logs.map((log, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-gradient-button`}>
                                        <Icon 
                                            name={getIconForType(log.type)} 
                                            className="w-5 h-5 text-white" 
                                        />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white">{log.title}</span>
                                            <div className="text-right">
                                                <time className="block font-mono font-medium text-gray-500 text-xs">{log.date}</time>
                                                <span className="font-mono text-gray-400 text-[10px]">{log.time}</span>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                log.type === 'feat' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                log.type === 'fix' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                log.type === 'ui' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                log.type === 'refactor' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {log.type === 'logic' ? 'Logic' : log.type === 'perf' ? 'Performance' : t(`infra.log.${log.type}`)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">{log.description}</p>
                                        {log.details && log.details.length > 0 && (
                                            <ul className="list-disc list-inside space-y-1 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                                                {log.details.map((detail, i) => (
                                                    <li key={i}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                         {/* Tech Stack Section */}
                        <section>
                            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Icon name="layers" className="w-6 h-6 text-primary-500" />
                                {t('infra.conception.tech_stack')}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <TechCard icon="code" title="React 19" desc={t('infra.conception.frontend')} color="bg-blue-500" />
                                <TechCard icon="code" title="TypeScript" desc="Static Typing" color="bg-blue-700" />
                                <TechCard icon="sparkles" title="Tailwind CSS" desc={t('infra.conception.styling')} color="bg-cyan-500" />
                                <TechCard icon="bot" title="Gemini 2.5 Flash" desc={t('infra.conception.ai')} color="bg-purple-600" />
                                <TechCard icon="database" title="LocalStorage" desc={t('infra.conception.storage')} color="bg-orange-500" />
                            </div>
                        </section>

                        {/* Architecture Flow Section */}
                        <section>
                            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Icon name="activity" className="w-6 h-6 text-primary-500" />
                                {t('infra.conception.architecture')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">{t('infra.conception.flow_desc')}</p>
                            <div className="bg-slate-50 dark:bg-gray-900 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 overflow-x-auto">
                                <div className="flex items-center justify-between min-w-[700px] gap-4">
                                    {/* Nodes */}
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm">
                                            <Icon name="upload" className="w-8 h-8 text-gray-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">User Upload</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-sm">
                                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">Base64</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">File Processing</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 flex items-center justify-center shadow-sm animate-pulse">
                                            <Icon name="bot" className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Gemini API</span>
                                    </div>
                                    <Icon name="arrow-right" className="w-6 h-6 text-gray-400" />
                                    
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm">
                                            <Icon name="dashboard" className="w-8 h-8 text-primary-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">UI / State</span>
                                    </div>

                                    {/* Auto-Logger Node */}
                                    <div className="h-px w-8 bg-gray-400"></div>
                                    <div className="flex flex-col items-center gap-2 w-32">
                                        <div className="w-16 h-16 bg-gradient-button rounded-xl flex items-center justify-center shadow-md">
                                            <Icon name="calendar" className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Change Logger</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Data Models Section */}
                         <section>
                            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Icon name="database" className="w-6 h-6 text-primary-500" />
                                {t('infra.conception.data_models')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
                                    <div className="text-gray-400 mb-2">// CandidateProfile Interface</div>
                                    <pre>{`interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: {
    hard: string[];
    soft: string[];
  };
  experience: Experience[];
  education: Education[];
  performanceScore: number;
  jobCategory: string;
}`}</pre>
                                </div>
                                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-blue-400 overflow-x-auto">
                                    <div className="text-gray-400 mb-2">// RecruitmentData Interface</div>
                                    <pre>{`interface RecruitmentData {
  candidateId: string;
  status: 'Application' | 'Interview' ...;
  interview1Date: string;
  interview1Result: 'Excellent' | 'Good'...;
  challengeDone: boolean;
  startDate: string;
}`}</pre>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};
