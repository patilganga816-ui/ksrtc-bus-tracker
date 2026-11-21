// =====================================================================
// KSRTC Local Bus Tracking System — Leaflet.js & Map Specialist Helper
// Hubballi–Dharwad Transit Corridor Configuration
// =====================================================================

const MapHelper = {
    /**
     * Initializes a Leaflet Map with OpenStreetMap tiles configured for Hubballi-Dharwad
     */
    initMap(containerId, options = {}) {
        const config = (window.KSRTC_CONFIG && window.KSRTC_CONFIG.MAP_CONFIG) || {
            center: [15.4200, 75.0800],
            defaultZoom: 12,
            bounds: [[15.1500, 74.9500], [15.5500, 75.3000]],
            tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | KSRTC Local'
        };

        const map = L.map(containerId, {
            center: options.center || config.center,
            zoom: options.zoom || config.defaultZoom,
            minZoom: 10,
            maxZoom: 18,
            maxBounds: config.bounds,
            maxBoundsViscosity: 0.8,
            ...options
        });

        L.tileLayer(config.tileLayer, {
            attribution: config.attribution,
            maxZoom: 19
        }).addTo(map);

        return map;
    },

    /**
     * Creates a custom animated KSRTC Bus Marker icon
     */
    createBusIcon(busNumber = 'KSRTC', heading = 0, isSimulated = false) {
        const badgeColor = isSimulated ? '#f59e0b' : '#0056b3';
        const modeLabel = isSimulated ? 'SIM' : 'LIVE';

        return L.divIcon({
            className: 'ksrtc-bus-marker-wrapper',
            html: `
                <div class="bus-marker-pin" style="transform: rotate(${heading || 0}deg);">
                    <div class="bus-pulse-ring" style="border-color: ${badgeColor};"></div>
                    <div class="bus-icon-circle" style="background-color: ${badgeColor};">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                        </svg>
                    </div>
                    <span class="bus-badge-label" style="background: ${badgeColor};">${busNumber} [${modeLabel}]</span>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -22]
        });
    },

    /**
     * Creates custom bus stop marker icons
     */
    createStopIcon(type = 'regular', stopName = '') {
        let bgColor = '#0284c7';
        let text = '🚏';

        if (type === 'boarding') {
            bgColor = '#16a34a';
            text = '🟢';
        } else if (type === 'destination') {
            bgColor = '#dc2626';
            text = '🔴';
        }

        return L.divIcon({
            className: 'ksrtc-stop-marker-wrapper',
            html: `
                <div class="stop-marker-pin" style="background-color: ${bgColor};">
                    <span class="stop-marker-emoji">${text}</span>
                </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            popupAnchor: [0, -14]
        });
    },

    /**
     * Draws an official KSRTC Transit Route Polyline
     */
    drawRouteLine(map, coordinates, options = {}) {
        const polyline = L.polyline(coordinates, {
            color: options.color || '#0056b3',
            weight: options.weight || 6,
            opacity: options.opacity || 0.85,
            lineJoin: 'round',
            dashArray: options.dashArray || null
        }).addTo(map);

        if (options.fitBounds && coordinates.length > 0) {
            map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
        }

        return polyline;
    },

    /**
     * Smoothly pans and repositions a marker
     */
    updateMarkerPosition(marker, newLat, newLng, heading = 0, busNumber = 'KSRTC', isSimulated = false) {
        if (!marker) return;
        marker.setLatLng([newLat, newLng]);
        marker.setIcon(this.createBusIcon(busNumber, heading, isSimulated));
    },

    /**
     * Computes human-readable age of coordinate fix
     */
    formatLocationAge(timestamp) {
        if (!timestamp) return (window.i18n && i18n.t('waitingFix')) || 'No GPS fix yet';
        const ageSec = Math.round((new Date().getTime() - new Date(timestamp).getTime()) / 1000);

        const lang = (window.i18n && i18n.getLanguage()) || 'en';
        if (ageSec < 5) {
            return lang === 'kn' ? 'ಲೈವ್ (ಈಗಷ್ಟೇ)' : (lang === 'hi' ? 'लाइव (अभी)' : 'Live (Just now)');
        }
        if (ageSec < 60) {
            return lang === 'kn' ? `ಲೈವ್ (${ageSec} ಸೆ. ಹಿಂದೆ)` : (lang === 'hi' ? `लाइव (${ageSec} से. पहले)` : `Live (${ageSec}s ago)`);
        }
        const mins = Math.floor(ageSec / 60);
        if (mins < 60) {
            return lang === 'kn' ? `ಸಿಗ್ನಲ್ ವಿಳಂಬ (${mins} ನಿಮಿಷ ಹಿಂದೆ)` : (lang === 'hi' ? `सिग्नल में देरी (${mins} मिनट पहले)` : `Signal Delayed (${mins}m ago)`);
        }
        return lang === 'kn' ? 'ಸಿಗ್ನಲ್ ಹಳೆಯದಾಗಿದೆ (> 1 ಗಂಟೆ)' : (lang === 'hi' ? 'सिग्नल पुराना है (> 1 घंटा)' : 'Signal Outdated (> 1 hour ago)');
    }
};

window.MapHelper = MapHelper;
