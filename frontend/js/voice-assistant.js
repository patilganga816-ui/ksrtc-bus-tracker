// =====================================================================
// KSRTC Local Bus Tracking System — Multilingual Voice Assistant Module
// Supports: Speech-to-Text (Voice Search/Commands) & Text-to-Speech (Announcements)
// Languages: English (en-IN), Kannada (kn-IN), Hindi (hi-IN)
// =====================================================================

class KSRTCVoiceAssistant {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.recognition = null;
        this.isListening = false;
        this.currentLang = 'en';
        this.voices = [];
        this.initRecognition();
        this.loadVoices();

        // Listen for language changes
        window.addEventListener('ksrtc:languageChanged', (e) => {
            if (e.detail && e.detail.language) {
                this.setLanguage(e.detail.language);
            }
        });
    }

    loadVoices() {
        if (!this.synth) return;
        this.voices = this.synth.getVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    setLanguage(lang) {
        this.currentLang = ['en', 'kn', 'hi'].includes(lang) ? lang : 'en';
        if (this.recognition) {
            this.recognition.lang = this.getRecognitionLocale();
        }
    }

    getRecognitionLocale() {
        switch (this.currentLang) {
            case 'kn': return 'kn-IN';
            case 'hi': return 'hi-IN';
            case 'en':
            default: return 'en-IN';
        }
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
        if (!SpeechRecognition) {
            console.warn('Web Speech API Recognition not supported in this browser.');
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 3;
            this.recognition.lang = this.getRecognitionLocale();
        } catch (e) {
            console.warn('Failed to initialize SpeechRecognition:', e);
        }
    }

    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    /**
     * Start speech-to-text listening with UI callback hooks
     */
    startListening(options = {}) {
        if (!this.isSupported()) {
            if (options.onError) {
                options.onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            }
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        if (!this.recognition) {
            this.initRecognition();
        }

        this.recognition.lang = this.getRecognitionLocale();

        this.recognition.onstart = () => {
            this.isListening = true;
            if (options.onStart) options.onStart();
        };

        this.recognition.onresult = (event) => {
            this.isListening = false;
            const transcript = event.results[0][0].transcript;
            if (options.onResult) {
                options.onResult(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            let msg = 'Voice recognition error.';
            if (event.error === 'not-allowed') {
                msg = 'Microphone access blocked. Please allow microphone permission in your browser.';
            } else if (event.error === 'no-speech') {
                msg = 'No speech detected. Please speak clearly into your microphone.';
            }
            if (options.onError) options.onError(msg);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (options.onEnd) options.onEnd();
        };

        try {
            this.recognition.start();
        } catch (err) {
            console.warn('Speech recognition start failed:', err);
            this.isListening = false;
            if (options.onEnd) options.onEnd();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Text-To-Speech announcement in active language (en, kn, hi)
     */
    speak(text, options = {}) {
        if (!this.synth) {
            console.warn('SpeechSynthesis not available.');
            return;
        }

        // Cancel previous speech if ongoing
        this.synth.cancel();

        if (!text || text.trim() === '') return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getRecognitionLocale();
        utterance.rate = options.rate || 0.95; // Slightly slower for clear transit announcements
        utterance.pitch = options.pitch || 1.0;

        // Try to pick appropriate Indian accent / regional voice if installed
        if (this.voices && this.voices.length > 0) {
            const targetLang = utterance.lang.toLowerCase();
            const matchedVoice = this.voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) ||
                                 this.voices.find(v => v.lang.toLowerCase().includes('in'));
            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }
        }

        if (options.onStart) utterance.onstart = options.onStart;
        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onError) utterance.onerror = options.onError;

        this.synth.speak(utterance);
    }

    /**
     * Specialized transit announcement for ETA and bus arrival
     */
    announceArrival(busNumber, stopName, etaMinutes, distanceStr) {
        let announcement = '';
        const lang = this.currentLang;

        if (lang === 'kn') {
            if (etaMinutes === 0 || etaMinutes === '< 1' || etaMinutes === 'now') {
                announcement = `ಗಮನಿಸಿ. ಬಸ್ಸು ${busNumber} ಈಗ ${stopName} ನಿಲ್ದಾಣವನ್ನು ತಲುಪುತ್ತಿದೆ.`;
            } else if (etaMinutes && typeof etaMinutes === 'number') {
                announcement = `ಬಸ್ಸು ${busNumber}, ${stopName} ನಿಲ್ದಾಣಕ್ಕೆ ಅಂದಾಜು ${etaMinutes} ನಿಮಿಷಗಳಲ್ಲಿ ತಲುಪಲಿದೆ. ದೂರ ${distanceStr || ''}.`;
            } else {
                announcement = `ಬಸ್ಸು ${busNumber}, ${stopName} ನಿಲ್ದಾಣದ ಕಡೆಗೆ ಬರುತ್ತಿದೆ.`;
            }
        } else if (lang === 'hi') {
            if (etaMinutes === 0 || etaMinutes === '< 1' || etaMinutes === 'now') {
                announcement = `कृपया ध्यान दें। बस ${busNumber} अब ${stopName} स्टॉप पर पहुँच रही है।`;
            } else if (etaMinutes && typeof etaMinutes === 'number') {
                announcement = `बस ${busNumber}, ${stopName} स्टॉप पर लगभग ${etaMinutes} मिनट में पहुँचेगी। दूरी ${distanceStr || ''}.`;
            } else {
                announcement = `बस ${busNumber}, ${stopName} स्टॉप की ओर आ रही है।`;
            }
        } else {
            // English default
            if (etaMinutes === 0 || etaMinutes === '< 1' || etaMinutes === 'now') {
                announcement = `Attention passengers. Bus ${busNumber} is arriving now at ${stopName}.`;
            } else if (etaMinutes && typeof etaMinutes === 'number') {
                announcement = `Bus ${busNumber} will reach ${stopName} in approximately ${etaMinutes} minutes. Distance remaining: ${distanceStr || ''}.`;
            } else {
                announcement = `Bus ${busNumber} is on its way to ${stopName}.`;
            }
        }

        this.speak(announcement);
    }
}

// Global instance
window.ksrtcVoice = new KSRTCVoiceAssistant();
