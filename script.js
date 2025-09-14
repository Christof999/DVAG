// Firebase Configuration - DVAG Peter Köpplinger
const firebaseConfig = {
    apiKey: "AIzaSyCJ7fThqn2fmFvgIgVabX96Qb37MFfdhVg",
    authDomain: "dvag-9ace3.firebaseapp.com",
    databaseURL: "https://dvag-9ace3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dvag-9ace3",
    storageBucket: "dvag-9ace3.firebasestorage.app",
    messagingSenderId: "32859450694",
    appId: "1:32859450694:web:180052a6b6a2e97b208947",
    measurementId: "G-P4LHKT2XRY"
};

// EmailJS Configuration - Aktualisiert für neue EmailJS API
const emailjsConfig = {
    serviceId: 'service_qvyygul',
    templateId: 'template_g3w1rxb', 
    publicKey: '-EYhqzwww9NbSfZjJ'  // Public Key aus EmailJS Dashboard
};

// Firebase importieren und initialisieren
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';

// Firebase App initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// EmailJS initialisieren
document.addEventListener('DOMContentLoaded', function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(emailjsConfig.publicKey);
        console.log('✅ EmailJS initialisiert mit Public Key');
    } else {
        console.error('❌ EmailJS konnte nicht geladen werden');
    }
});

// Test-Funktion zum direkten Testen
async function testFirebaseConnection() {
    console.log('🧪 Teste Firebase-Verbindung...');
    try {
        const testData = {
            test: 'Testdaten',
            timestamp: new Date().toISOString(),
            message: 'Dies ist ein Test'
        };
        
        const testRef = ref(database, 'test-verbindung');
        const newTestRef = push(testRef);
        await set(newTestRef, testData);
        
        console.log('✅ Firebase-Test erfolgreich!');
        alert('✅ Firebase-Verbindung funktioniert!');
        return true;
    } catch (error) {
        console.error('❌ Firebase-Test fehlgeschlagen:', error);
        alert('❌ Firebase-Fehler: ' + error.message);
        return false;
    }
}

// DOM-Elemente (werden nach DOM-Load definiert)
let contactForm, submitBtn, btnText, loadingSpinner, successMessage, formContainer;

// Warten bis DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // DOM-Elemente nach dem Laden definieren
    contactForm = document.getElementById('contactForm');
    submitBtn = document.querySelector('.submit-btn');
    btnText = document.querySelector('.btn-text');
    loadingSpinner = document.querySelector('.loading-spinner');
    successMessage = document.getElementById('success-message');
    formContainer = document.querySelector('.form-container');

    // Event Listener für das Formular
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Formular-Event-Listener wurde registriert');
    } else {
        console.error('❌ Kontaktformular nicht gefunden!');
    }
    
    // Echtzeit-Validierung für alle Input-Felder
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateSingleField(this);
        });
        
        input.addEventListener('input', function() {
            // Fehlerklasse entfernen wenn User tippt
            this.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
    
    console.log('✅ Input-Validierung wurde registriert für', inputs.length, 'Felder');
    
    // Produktionsversion - Test-Funktionen deaktiviert
    // window.testFirebaseConnection = testFirebaseConnection;
    console.log('✅ Kontaktformular ist produktionsbereit');
});

// Formular-Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Button in Loading-Zustand versetzen
    setLoadingState(true);
    
    try {
        // Formulardaten sammeln
        const formData = {
            name: getInputValue('name'),
            phone: getInputValue('phone'),
            email: getInputValue('email'),
            message: getInputValue('message'),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('de-DE'),
            time: new Date().toLocaleTimeString('de-DE')
        };
        
        // Validierung
        if (!validateFormData(formData)) {
            setLoadingState(false);
            return;
        }
        
        // Daten an Firebase senden
        await saveToFirebase(formData);
        
        // E-Mail-Benachrichtigung senden
        await sendEmailNotification(formData);
        
        // Erfolg anzeigen
        showSuccessMessage();
        
        // Formular zurücksetzen
        contactForm.reset();
        
    } catch (error) {
        console.error('Fehler beim Senden der Anfrage:', error);
        showErrorMessage();
    } finally {
        setLoadingState(false);
    }
}

// Hilfsfunktion: Input-Wert abrufen
function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

// Hilfsfunktion: Formulardaten validieren
function validateFormData(data) {
    // Name validieren
    if (data.name.length < 2) {
        showFieldError('name', 'Name muss mindestens 2 Zeichen lang sein');
        return false;
    }
    
    // E-Mail validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFieldError('email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
        return false;
    }
    
    // Telefonnummer validieren (deutsche Nummern)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(data.phone)) {
        showFieldError('phone', 'Bitte geben Sie eine gültige Telefonnummer ein');
        return false;
    }
    
    // Nachricht validieren
    if (data.message.length < 10) {
        showFieldError('message', 'Nachricht muss mindestens 10 Zeichen lang sein');
        return false;
    }
    
    // Privacy Checkbox prüfen
    if (!document.getElementById('privacy').checked) {
        showFieldError('privacy', 'Bitte stimmen Sie der Datenverarbeitung zu');
        return false;
    }
    
    return true;
}

// Hilfsfunktion: Feldfehler anzeigen
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const existingError = field.parentNode.querySelector('.error-message');
    
    // Vorherige Fehlermeldung entfernen
    if (existingError) {
        existingError.remove();
    }
    
    // Fehlerklasse hinzufügen
    field.classList.add('error');
    
    // Fehlermeldung erstellen
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    
    // Fehlermeldung einfügen
    field.parentNode.appendChild(errorDiv);
    
    // Field Focus für bessere UX
    field.focus();
    
    // Fehlerklasse nach 5 Sekunden entfernen
    setTimeout(() => {
        field.classList.remove('error');
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Hilfsfunktion: Daten in Firebase speichern
async function saveToFirebase(data) {
    console.log('💾 Versuche Daten zu speichern:', data);
    
    try {
        const contactRef = ref(database, 'kontaktanfragen');
        console.log('📁 Referenz erstellt:', contactRef);
        
        const newContactRef = push(contactRef);
        console.log('🆕 Push-Referenz erstellt:', newContactRef.key);
        
        const fullData = {
            ...data,
            status: 'neu',
            bearbeiter: 'Peter Köpplinger'
        };
        
        console.log('📦 Vollständige Daten zum Speichern:', fullData);
        
        await set(newContactRef, fullData);
        
        console.log('✅ Kontaktanfrage erfolgreich gespeichert mit ID:', newContactRef.key);
        console.log('🔗 Gespeichert unter:', `kontaktanfragen/${newContactRef.key}`);
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern in Firebase:', error);
        console.error('📋 Error Details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Hilfsfunktion: E-Mail-Benachrichtigung senden
async function sendEmailNotification(data) {
    console.log('📧 Versuche E-Mail-Benachrichtigung zu senden...');
    
    try {
        // Prüfen ob EmailJS verfügbar ist
        if (typeof emailjs === 'undefined') {
            console.warn('⚠️ EmailJS nicht verfügbar - E-Mail wird übersprungen');
            return;
        }
        
        // Prüfen ob EmailJS konfiguriert ist
        if (emailjsConfig.serviceId === 'YOUR_EMAILJS_SERVICE_ID' || emailjsConfig.publicKey === 'YOUR_PUBLIC_KEY') {
            console.warn('⚠️ EmailJS nicht konfiguriert - E-Mail wird übersprungen');
            return;
        }
        
        // E-Mail-Parameter vorbereiten
        const emailParams = {
            // An: Ihre E-Mail-Adresse
            to_email: 'christof.didi@googlemail.com',
            to_name: 'Peter Köpplinger',
            reply_to: data.email, // Antwort-Adresse für direkten Kundenkontakt
            
            // Von: Kunde
            from_name: data.name,
            from_email: data.email,
            from_phone: data.phone,
            
            // Nachricht
            message: data.message,
            
            // Zusätzliche Informationen
            date: data.date,
            time: data.time,
            timestamp: data.timestamp,
            
            // Betreff
            subject: `Neue Kontaktanfrage von ${data.name} - DVAG Peter Köpplinger`
        };
        
        console.log('📮 Sende E-Mail mit Parametern:', emailParams);
        console.log('🔧 EmailJS Config:', {
            serviceId: emailjsConfig.serviceId,
            templateId: emailjsConfig.templateId,
            publicKey: emailjsConfig.publicKey
        });
        
        // E-Mail über EmailJS senden
        const response = await emailjs.send(
            emailjsConfig.serviceId,
            emailjsConfig.templateId,
            emailParams
        );
        
        console.log('✅ E-Mail erfolgreich gesendet:', response);
        
    } catch (error) {
        console.error('❌ Fehler beim Senden der E-Mail:', error);
        console.error('📋 Fehler Details:', {
            message: error.message,
            status: error.status,
            text: error.text
        });
        
        // Mögliche Lösungsvorschläge basierend auf Fehlertyp
        if (error.status === 400) {
            console.error('🔍 400-Fehler Diagnose:');
            console.error('- Template ID existiert?', emailjsConfig.templateId);
            console.error('- Service ID korrekt?', emailjsConfig.serviceId);
            console.error('- Alle Template-Parameter vorhanden?');
            console.error('- Template gespeichert in EmailJS Dashboard?');
        }
        
        // Fehler wird nicht an den Benutzer weitergegeben - Firebase funktioniert weiterhin
        console.warn('⚠️ E-Mail-Versand fehlgeschlagen, aber Kontaktanfrage wurde in Firebase gespeichert');
    }
}

// Hilfsfunktion: Loading-Zustand setzen
function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        submitBtn.style.opacity = '0.7';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        submitBtn.style.opacity = '1';
    }
}

// Hilfsfunktion: Erfolgsmeldung anzeigen
function showSuccessMessage() {
    // Formular ausblenden
    contactForm.style.display = 'none';
    
    // Erfolgsmeldung anzeigen
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Nach 5 Sekunden automatisch zurück zum Formular
    setTimeout(() => {
        successMessage.style.display = 'none';
        contactForm.style.display = 'block';
    }, 8000);
}

// Hilfsfunktion: Fehlermeldung anzeigen
function showErrorMessage() {
    alert('Entschuldigung, beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie mich direkt.');
}

// Input-Validierung wird in der Haupt-DOMContentLoaded-Funktion initialisiert

// Einzelfeld-Validierung
function validateSingleField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    
    switch(fieldId) {
        case 'name':
            if (value.length > 0 && value.length < 2) {
                showFieldError(fieldId, 'Name muss mindestens 2 Zeichen lang sein');
            }
            break;
            
        case 'email':
            if (value.length > 0) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    showFieldError(fieldId, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
                }
            }
            break;
            
        case 'phone':
            if (value.length > 0) {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(value)) {
                    showFieldError(fieldId, 'Bitte geben Sie eine gültige Telefonnummer ein');
                }
            }
            break;
            
        case 'message':
            if (value.length > 0 && value.length < 10) {
                showFieldError(fieldId, 'Nachricht muss mindestens 10 Zeichen lang sein');
            }
            break;
    }
}

// Portrait-Bild Upload-Funktionalität (optional)
function enablePortraitUpload() {
    const portraitImg = document.getElementById('portrait-img');
    
    // Klick-Handler für Bild-Upload (falls gewünscht)
    portraitImg.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    portraitImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    });
}

// CSS für Fehlerfelder dynamisch hinzufügen
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #e74c3c !important;
        background-color: #fdf2f2 !important;
    }
    
    .error-message {
        animation: fadeInError 0.3s ease-in;
    }
    
    @keyframes fadeInError {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Console-Log für Debugging
console.log('🔥 DVAG Kontaktformular geladen - Peter Köpplinger');
console.log('📊 Firebase Config:', firebaseConfig.projectId ? 'Konfiguriert ✅' : 'NICHT KONFIGURIERT ❌');
console.log('🗃️ Database URL:', firebaseConfig.databaseURL);
console.log('🆔 Project ID:', firebaseConfig.projectId);


