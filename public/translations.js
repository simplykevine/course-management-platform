// Translation dictionary for multiple languages
const translations = {
    en: {
        // Page metadata
        pageTitle: "Course Reflection",
        
        // Header
        welcomeMessage: "Welcome to your course reflection page",
        
        // Main content
        reflectionHeading: "Share Your Experience",
        
        // Questions
        question1: "What did you enjoy most about the course?",
        question2: "What was the most challenging part?",
        question3: "What could be improved?",
        
        // Placeholders
        placeholder: "Type your answer here...",
        
        // Submit section
        submitButton: "Submit Reflection",
        submitSuccess: "Thank you! Your reflection has been submitted successfully.",
        submitError: "Sorry, there was an error submitting your reflection. Please try again.",
        
        // Footer
        footerText: "© 2025 Course Management Platform. All rights reserved."
    },
    
    fr: {
        // Page metadata
        pageTitle: "Réflexion sur le cours",
        
        // Header
        welcomeMessage: "Bienvenue sur votre page de réflexion de cours",
        
        // Main content
        reflectionHeading: "Partagez votre expérience",
        
        // Questions
        question1: "Qu'avez-vous le plus apprécié dans ce cours ?",
        question2: "Quelle a été la partie la plus difficile ?",
        question3: "Qu'est-ce qui pourrait être amélioré ?",
        
        // Placeholders
        placeholder: "Tapez votre réponse ici...",
        
        // Submit section
        submitButton: "Soumettre la réflexion",
        submitSuccess: "Merci ! Votre réflexion a été soumise avec succès.",
        submitError: "Désolé, une erreur s'est produite lors de la soumission. Veuillez réessayer.",
        
        // Footer
        footerText: "© 2025 Plateforme de gestion de cours. Tous droits réservés."
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}