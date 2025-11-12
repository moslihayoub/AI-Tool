export const fr = {
    sidebar: {
        upload: "Importer CVs",
        dashboard: "Tableau de bord",
        favorites: "Favoris",
        settings: "Paramètres",
        footer: "Généré par Moslih84"
    },
    upload: {
        title: "Importer des CVs",
        subtitle: "Glissez-déposez des fichiers ou cliquez pour les sélectionner.",
        dropzone: {
            release: "Relâchez les fichiers ici",
            prompt: "Glissez-déposez des fichiers ici, ou cliquez pour sélectionner",
            supported_files: "Fichiers supportés: PDF, TXT, JSON, MD, CSV, Fichiers Office"
        },
        google_drive_import: "Importer via Google Drive",
        pending_files: {
            title: "Fichiers en attente ({{count}})",
            analyze_button: "Analyser ({{count}}) Fichier{{plural:count}}"
        },
        status: {
            pending: "En attente",
            parsing: "Analyse...",
            success: "Succès",
            error: "Erreur"
        }
    },
    dashboard: {
        title: "Tableau de bord",
        subtitle: "Visualisez les données et les profils extraits des CVs.",
        favorites_title: "Profils Favoris",
        no_favorites: "Vous n'avez ajouté aucun profil à vos favoris.",
        filter_by_job: "Filtrer par métier",
        jobs_selected: "{{count}} métier{{plural:count}} sélectionné{{plural:count}}",
        clear_filters: "Effacer les filtres",
        no_cv_analyzed: "Aucun CV n'a encore été analysé. Veuillez en importer depuis l'onglet \"Importer CVs\".",
        incomplete_profile_tooltip: "Informations clés (nom, métier) manquantes.",
        experience_years: "{{count}} an{{plural:count}} d'exp.",
        candidate_profiles: "Profils des candidats ({{count}})",
        charts: {
            perf_by_job: "Score de Performance par Métier",
            job_distribution: "Répartition par métier",
            exp_distribution: "Distribution par niveau d'expérience",
            location_distribution: "Nombre de CVs par ville",
            avg_score: "Score Moyen",
            candidates: "Candidats",
            num_cvs: "Nombre de CVs",
            other: "Autre",
            no_data: "Pas de données"
        },
        exp_buckets: {
            junior: "Junior (0-2 ans)",
            confirmed: "Confirmé (3-5 ans)",
            senior: "Senior (6-10 ans)",
            expert: "Expert (10+ ans)"
        }
    },
    detail: {
        loading: "Chargement du profil du candidat...",
        score: "Score",
        add_to_favorites: "Ajouter aux favoris",
        remove_from_favorites: "Retirer des favoris",
        profile_summary: "Résumé du Profil",
        no_summary: "Aucun résumé disponible.",
        skills: "Compétences",
        skills_chart: "Graphique des compétences",
        not_enough_skills_for_chart: "Pas assez de compétences techniques pour générer un graphique (minimum 3).",
        hard_skills: "Hard Skills",
        soft_skills: "Soft Skills",
        work_experience: "Expérience Professionnelle",
        no_description: "Aucune description fournie.",
        education: "Formation"
    },
    ai_assistant: {
        title: "Assistant IA",
        greeting: "Bonjour ! 👋 Comment puis-je vous aider à analyser ce profil ?",
        error: "Désolé, une erreur est survenue. Veuillez réessayer. 😥",
        input_placeholder: "Posez une question...",
        quick_questions: {
            summary: "Résume ce profil en 3 points.",
            strengths: "Quelles sont ses 3 plus grandes forces ?",
            fit_for_role: "Ce profil correspond-il à un poste de Développeur Senior ?"
        }
    },
    settings: {
        title: "Paramètres",
        subtitle: "Gérez les préférences de l'application.",
        language: {
            title: "Langue",
            french: "Français",
            english: "English"
        },
        theme: {
            title: "Thème",
            light: "Clair",
            dark: "Sombre",
            system: "Système"
        },
        data: {
            title: "Gestion des données",
            load_dummy: "Charger données d'exemple",
            dummy_description: "Remplissez l'application avec des profils d'exemple pour explorer toutes les fonctionnalités."
        }
    },
    analysis: {
        title: "Analyse en cours...",
        subtitle: "Votre patience est appréciée pendant que nous traitons les CVs.",
        progress_cvs: "{{progress}} / {{total}} CVs",
        elapsed_time: "Temps écoulé : {{time}}s",
        summary_incomplete: "Analyse terminée. {{count}} CV{{plural:count}} ont des informations clés manquantes et pourrait nécessiter une vérification."
    },
    common: {
        reset: "Réinitialiser",
        reset_confirm: "Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.",
        reset_confirm_action: "Confirmer ?",
        export: "Exporter",
        storageError: "Erreur de stockage",
        info: "Info",
        analyzed_in: "analysé en {{duration}}s",
        name_not_available: "Nom non disponible",
        category_not_available: "Catégorie non renseignée",
        location_not_available: "Lieu non renseigné",
        email_not_available: "Email non renseigné",
        title_not_available: "Titre non renseigné",
        company_not_available: "Entreprise non renseignée",
        dates_not_available: "Dates non renseignées",
        degree_not_available: "Diplôme non renseigné",
        school_not_available: "École non renseignée"
    },
    errors: {
        storageFull: "L'espace de stockage est plein. Veuillez réinitialiser les données pour libérer de l'espace.",
        saveError: "Erreur de sauvegarde",
        unknownSaveError: "Une erreur inconnue est survenue lors de la sauvegarde."
    }
};

export const en = {
    sidebar: {
        upload: "Import CVs",
        dashboard: "Dashboard",
        favorites: "Favorites",
        settings: "Settings",
        footer: "Generated By Moslih84"
    },
    upload: {
        title: "Import CVs",
        subtitle: "Drag and drop files or click to select them.",
        dropzone: {
            release: "Release files here",
            prompt: "Drag and drop files here, or click to select",
            supported_files: "Supported files: PDF, TXT, JSON, MD, CSV, Office Files"
        },
        google_drive_import: "Import from Google Drive",
        pending_files: {
            title: "Pending Files ({{count}})",
            analyze_button: "Analyze ({{count}}) File{{plural:count}}"
        },
        status: {
            pending: "Pending",
            parsing: "Parsing...",
            success: "Success",
            error: "Error"
        }
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Visualize data and profiles extracted from the CVs.",
        favorites_title: "Favorite Profiles",
        no_favorites: "You haven't added any profiles to your favorites yet.",
        filter_by_job: "Filter by Job",
        jobs_selected: "{{count}} job{{plural:count}} selected",
        clear_filters: "Clear Filters",
        no_cv_analyzed: "No CVs have been analyzed yet. Please import some from the \"Import CVs\" tab.",
        incomplete_profile_tooltip: "Key information (name, job) is missing.",
        experience_years: "{{count}} year{{plural:count}} exp.",
        candidate_profiles: "Candidate Profiles ({{count}})",
        charts: {
            perf_by_job: "Performance Score by Job Category",
            job_distribution: "Job Category Distribution",
            exp_distribution: "Experience Level Distribution",
            location_distribution: "Number of CVs by City",
            avg_score: "Average Score",
            candidates: "Candidates",
            num_cvs: "Number of CVs",
            other: "Other",
            no_data: "No data available"
        },
        exp_buckets: {
            junior: "Junior (0-2 yrs)",
            confirmed: "Confirmed (3-5 yrs)",
            senior: "Senior (6-10 yrs)",
            expert: "Expert (10+ yrs)"
        }
    },
    detail: {
        loading: "Loading candidate profile...",
        score: "Score",
        add_to_favorites: "Add to favorites",
        remove_from_favorites: "Remove from favorites",
        profile_summary: "Profile Summary",
        no_summary: "No summary available.",
        skills: "Skills",
        skills_chart: "Skills Chart",
        not_enough_skills_for_chart: "Not enough hard skills to generate a chart (minimum 3 required).",
        hard_skills: "Hard Skills",
        soft_skills: "Soft Skills",
        work_experience: "Work Experience",
        no_description: "No description provided.",
        education: "Education"
    },
    ai_assistant: {
        title: "AI Assistant",
        greeting: "Hello! 👋 How can I help you analyze this profile?",
        error: "Sorry, an error occurred. Please try again. 😥",
        input_placeholder: "Ask a question...",
        quick_questions: {
            summary: "Summarize this profile in 3 points.",
            strengths: "What are their 3 main strengths?",
            fit_for_role: "Does this profile fit a Senior Developer role?"
        }
    },
    settings: {
        title: "Settings",
        subtitle: "Manage the application's preferences.",
        language: {
            title: "Language",
            french: "Français",
            english: "English"
        },
        theme: {
            title: "Theme",
            light: "Light",
            dark: "Dark",
            system: "System"
        },
        data: {
            title: "Data Management",
            load_dummy: "Load Dummy Data",
            dummy_description: "Populate the app with sample profiles to explore all features."
        }
    },
    analysis: {
        title: "Analysis in progress...",
        subtitle: "Your patience is appreciated while we process the CVs.",
        progress_cvs: "{{progress}} / {{total}} CVs",
        elapsed_time: "Elapsed time: {{time}}s",
        summary_incomplete: "Analysis complete. {{count}} CV{{plural:count}} have missing key information and may require review."
    },
    common: {
        reset: "Reset",
        reset_confirm: "Are you sure you want to delete all data? This action is irreversible.",
        reset_confirm_action: "Confirm?",
        export: "Export",
        storageError: "Storage Error",
        info: "Info",
        analyzed_in: "analyzed in {{duration}}s",
        name_not_available: "Name not available",
        category_not_available: "Category not provided",
        location_not_available: "Location not provided",
        email_not_available: "Email not provided",
        title_not_available: "Title not provided",
        company_not_available: "Company not provided",
        dates_not_available: "Dates not provided",
        degree_not_available: "Degree not provided",
        school_not_available: "School not provided"
    },
    errors: {
        storageFull: "Storage space is full. Please reset data to free up space.",
        saveError: "Save Error",
        unknownSaveError: "An unknown error occurred while saving."
    }
};