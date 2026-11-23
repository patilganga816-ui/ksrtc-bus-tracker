// =====================================================================
// KSRTC Local Bus Tracking System — AI Voice Assistant Client
// Powered by Deepgram API (with intelligent native Speech fallback)
// Announces next approaching bus stops and provides audio guidance
// =====================================================================

class DeepgramVoiceAssistant {
    constructor() {
        this.audioPlayer = new Audio();
        this.isEnabled = localStorage.getItem('ksrtc_voice_enabled') === 'true';
        this.lastAnnouncedStopId = null;
        this.isSpeaking = false;
        this.activeLanguage = 'en';

        // Listen for language changes
        window.addEventListener('ksrtc:languageChanged', (e) => {
            if (e.detail && e.detail.language) {
                this.activeLanguage = e.detail.language;
            }
        });
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('ksrtc_voice_enabled', this.isEnabled);
        this.updateUI();

        if (this.isEnabled) {
            this.speakDirect(
                this.activeLanguage === 'kn' ? 'ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಮುಂದಿನ ನಿಲ್ದಾಣಗಳನ್ನು ಪ್ರಕಟಿಸಲಾಗುವುದು.' :
                (this.activeLanguage === 'hi' ? 'आवाज़ सहायक सक्रिय है। अगले स्टॉप की घोषणा की जाएगी।' :
                'AI Voice Assistant enabled. Approaching bus stops will be announced.')
            );
        } else {
            this.stop();
        }
        return this.isEnabled;
    }

    stop() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.updateUI();
    }

    updateUI() {
        const btn = document.getElementById('btn-voice-assistant-toggle');
        const badge = document.getElementById('voice-status-badge');
        if (!btn) return;

        if (this.isEnabled) {
            btn.classList.add('active');
            btn.innerHTML = `<span>🔊</span> <span data-i18n="voiceOn">Voice: ON</span>`;
            btn.style.background = '#15803d';
            btn.style.color = '#ffffff';
            if (badge) badge.style.display = 'inline-flex';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = `<span>🔈</span> <span data-i18n="voiceOff">Voice: OFF</span>`;
            btn.style.background = '#f1f5f9';
            btn.style.color = '#334155';
            if (badge) badge.style.display = 'none';
        }
    }

    /**
     * Announces the next approaching bus stop
     * @param {Object} nextStop - The stop object containing name, sequence, etc.
     * @param {String} busNumber - Fleet registration or name
     * @param {Number} distanceMeters - Distance remaining to stop
     */
    async announceNextApproachingStop(nextStop, busNumber, distanceMeters) {
        if (!this.isEnabled) return;
        if (!nextStop || !nextStop.stop_name) return;

        // Prevent repeated announcements for the exact same stop unless progressed
        if (this.lastAnnouncedStopId === nextStop.id) {
            return;
        }

        this.lastAnnouncedStopId = nextStop.id;

        // Localize stop name based on current language
        let localizedStopName = nextStop.stop_name;
        if (window.i18n && typeof window.i18n.getLocalizedStopName === 'function') {
            localizedStopName = window.i18n.getLocalizedStopName(nextStop);
        }

        let announcementText = '';
        const lang = window.i18n ? window.i18n.getLanguage() : this.activeLanguage;

        if (lang === 'kn') {
            announcementText = `ಮುಂದಿನ ನಿಲ್ದಾಣ: ${localizedStopName}. ಬಸ್ಸು ${busNumber || ''} ಶೀಘ್ರದಲ್ಲೇ ತಲುಪಲಿದೆ.`;
        } else if (lang === 'hi') {
            announcementText = `अगला स्टॉप: ${localizedStopName}. बस ${busNumber || ''} जल्द ही पहुँच रही है।`;
        } else {
            announcementText = `Next stop approaching: ${localizedStopName}. Bus ${busNumber || ''}.`;
        }

        await this.speak(announcementText);
    }

    /**
     * Converts text into spoken audio using Deepgram TTS API
     * Falls back automatically to Web Speech API if offline or API key is pending
     */
    async speak(text) {
        if (!text || text.trim() === '') return;
        if (this.isSpeaking) return;

        this.isSpeaking = true;
        this.showSpeakingVisual(true);

        try {
            const apiBase = window.KSRTC_CONFIG ? window.KSRTC_CONFIG.API_BASE_URL : '/api';
            const response = await fetch(`${apiBase}/voice/speak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model: 'aura-2-thalia-en'
                })
            });

            if (response.ok && response.headers.get('content-type')?.includes('audio')) {
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);

                this.audioPlayer.src = audioUrl;
                this.audioPlayer.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    this.isSpeaking = false;
                    this.showSpeakingVisual(false);
                };
                this.audioPlayer.onerror = () => {
                    this.fallbackBrowserSpeech(text);
                };
                await this.audioPlayer.play();
                return;
            } else {
                // Server returned non-audio (fallback instruction or missing key)
                this.fallbackBrowserSpeech(text);
            }
        } catch (e) {
            console.warn('Deepgram voice API connection notice. Using browser speech fallback:', e);
            this.fallbackBrowserSpeech(text);
        }
    }

    speakDirect(text) {
        this.speak(text);
    }

    fallbackBrowserSpeech(text) {
        if (!('speechSynthesis' in window)) {
            this.isSpeaking = false;
            this.showSpeakingVisual(false);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = window.i18n ? window.i18n.getLanguage() : this.activeLanguage;

        if (lang === 'kn') utterance.lang = 'kn-IN';
        else if (lang === 'hi') utterance.lang = 'hi-IN';
        else utterance.lang = 'en-IN';

        utterance.rate = 0.95;
        utterance.onend = () => {
            this.isSpeaking = false;
            this.showSpeakingVisual(false);
        };
        utterance.onerror = () => {
            this.isSpeaking = false;
            this.showSpeakingVisual(false);
        };

        window.speechSynthesis.speak(utterance);
    }

    showSpeakingVisual(active) {
        const indicator = document.getElementById('voice-speaking-indicator');
        if (indicator) {
            indicator.style.display = active ? 'inline-flex' : 'none';
        }
    }
}

window.deepgramVoice = new DeepgramVoiceAssistant();
