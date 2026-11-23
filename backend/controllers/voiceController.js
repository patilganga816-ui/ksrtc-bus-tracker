// =====================================================================
// KSRTC Local Bus Tracking System — Voice Controller (Deepgram AI TTS)
// Converts stop arrival & transit announcements into realistic AI speech
// =====================================================================

const fetch = global.fetch || require('node-fetch');

/**
 * Text-to-Speech proxy endpoint for Deepgram API
 * POST /api/voice/speak
 * Body: { text: "Next stop approaching: Navanagar", model: "aura-2-thalia-en" }
 */
async function generateSpeech(req, res) {
    try {
        const { text, model } = req.body;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Text parameter is required for voice generation.'
            });
        }

        const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

        // If Deepgram API key is not configured, inform caller to fallback to browser speech synthesis
        if (!deepgramApiKey || deepgramApiKey === 'your_deepgram_api_key_here') {
            return res.status(503).json({
                success: false,
                fallback: true,
                message: 'Deepgram API key not configured in environment variables. Falling back to native browser speech.'
            });
        }

        const selectedModel = model || 'aura-2-thalia-en';
        const deepgramUrl = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(selectedModel)}`;

        const dgResponse = await fetch(deepgramUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${deepgramApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text.trim() })
        });

        if (!dgResponse.ok) {
            const errBody = await dgResponse.text();
            console.error('Deepgram API response error:', dgResponse.status, errBody);
            return res.status(dgResponse.status).json({
                success: false,
                fallback: true,
                message: `Deepgram API error: ${dgResponse.statusText}`
            });
        }

        // Stream the MP3 audio directly to client
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache common stop announcements
        
        // Handle stream piping
        if (dgResponse.body.pipe) {
            dgResponse.body.pipe(res);
        } else {
            const arrayBuffer = await dgResponse.arrayBuffer();
            res.send(Buffer.from(arrayBuffer));
        }

    } catch (err) {
        console.error('Voice generation server error:', err);
        return res.status(500).json({
            success: false,
            fallback: true,
            message: 'Internal server error processing Deepgram voice synthesis.'
        });
    }
}

module.exports = {
    generateSpeech
};
