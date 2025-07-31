// Language management
let currentLanguage = 'en';
const STORAGE_KEY = 'preferredLanguage';

// DOM elements
const elements = {
    pageTitle: document.getElementById('page-title'),
    welcomeMessage: document.getElementById('welcome-message'),
    reflectionHeading: document.getElementById('reflection-heading'),
    question1: document.getElementById('question-1'),
    question2: document.getElementById('question-2'),
    question3: document.getElementById('question-3'),
    answer1: document.getElementById('answer-1'),
    answer2: document.getElementById('answer-2'),
    answer3: document.getElementById('answer-3'),
    submitButton: document.getElementById('submit-btn'),
    submitMessage: document.getElementById('submit-message'),
    footerText: document.getElementById('footer-text'),
    languageButtons: document.querySelectorAll('.lang-btn')
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    setupEventListeners();
    loadSavedAnswers();
});

// Initialize language from localStorage or browser preference
function initializeLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // Try to detect browser language
        const browserLang = navigator.language.substring(0, 2);
        if (translations[browserLang]) {
            currentLanguage = browserLang;
        }
    }
    
    updateLanguage(currentLanguage);
    updateActiveLanguageButton();
}

// Set up event listeners
function setupEventListeners() {
    // Language switcher
    elements.languageButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
    
    // Submit button
    elements.submitButton.addEventListener('click', handleSubmit);
    
    // Auto-save answers
    [elements.answer1, elements.answer2, elements.answer3].forEach((textarea, index) => {
        textarea.addEventListener('input', () => {
            saveAnswerToLocalStorage(index + 1, textarea.value);
        });
    });
}

// Switch language
function switchLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        updateLanguage(lang);
        updateActiveLanguageButton();
    }
}

// Update page content with translations
function updateLanguage(lang) {
    const t = translations[lang];
    
    // Update text content
    document.title = t.pageTitle;
    elements.pageTitle.textContent = t.pageTitle;
    elements.welcomeMessage.textContent = t.welcomeMessage;
    elements.reflectionHeading.textContent = t.reflectionHeading;
    elements.question1.textContent = t.question1;
    elements.question2.textContent = t.question2;
    elements.question3.textContent = t.question3;
    elements.submitButton.textContent = t.submitButton;
    elements.footerText.textContent = t.footerText;
    
    // Update placeholders
    elements.answer1.placeholder = t.placeholder;
    elements.answer2.placeholder = t.placeholder;
    elements.answer3.placeholder = t.placeholder;
}

// Update active language button styling
function updateActiveLanguageButton() {
    elements.languageButtons.forEach(button => {
        if (button.getAttribute('data-lang') === currentLanguage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Handle form submission
function handleSubmit() {
    const answers = {
        question1: elements.answer1.value.trim(),
        question2: elements.answer2.value.trim(),
        question3: elements.answer3.value.trim(),
        language: currentLanguage,
        submittedAt: new Date().toISOString()
    };
    
    // Validate that at least one answer is provided
    if (!answers.question1 && !answers.question2 && !answers.question3) {
        showMessage('error');
        return;
    }
    
    // In a real application, this would send data to a server
    // For now, we'll just save to localStorage and show success
    saveSubmission(answers);
    showMessage('success');
    
    // Clear the form after successful submission
    setTimeout(() => {
        clearForm();
    }, 2000);
}

// Show submit message
function showMessage(type) {
    const t = translations[currentLanguage];
    const message = type === 'success' ? t.submitSuccess : t.submitError;
    
    elements.submitMessage.textContent = message;
    elements.submitMessage.className = `submit-message ${type}`;
    elements.submitMessage.classList.remove('hidden');
    
    // Hide message after 5 seconds
    setTimeout(() => {
        elements.submitMessage.classList.add('hidden');
    }, 5000);
}

// Save submission to localStorage
function saveSubmission(answers) {
    const submissions = JSON.parse(localStorage.getItem('reflectionSubmissions') || '[]');
    submissions.push(answers);
    localStorage.setItem('reflectionSubmissions', JSON.stringify(submissions));
    
    // Clear individual answer storage after submission
    localStorage.removeItem('reflection_answer_1');
    localStorage.removeItem('reflection_answer_2');
    localStorage.removeItem('reflection_answer_3');
}

// Save individual answer to localStorage (for auto-save)
function saveAnswerToLocalStorage(questionNumber, answer) {
    localStorage.setItem(`reflection_answer_${questionNumber}`, answer);
}

// Load saved answers from localStorage
function loadSavedAnswers() {
    const answer1 = localStorage.getItem('reflection_answer_1');
    const answer2 = localStorage.getItem('reflection_answer_2');
    const answer3 = localStorage.getItem('reflection_answer_3');
    
    if (answer1) elements.answer1.value = answer1;
    if (answer2) elements.answer2.value = answer2;
    if (answer3) elements.answer3.value = answer3;
}

// Clear form
function clearForm() {
    elements.answer1.value = '';
    elements.answer2.value = '';
    elements.answer3.value = '';
    
    // Clear localStorage
    localStorage.removeItem('reflection_answer_1');
    localStorage.removeItem('reflection_answer_2');
    localStorage.removeItem('reflection_answer_3');
}

// Optional: Detect if user is about to leave with unsaved changes
window.addEventListener('beforeunload', (e) => {
    const hasUnsavedChanges = 
        elements.answer1.value.trim() || 
        elements.answer2.value.trim() || 
        elements.answer3.value.trim();
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});