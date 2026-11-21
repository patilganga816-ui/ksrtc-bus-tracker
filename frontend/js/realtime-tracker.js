// =====================================================================
// KSRTC Local Bus Tracking System — Supabase Realtime Subscription Engine
// Handles Live Bus Telemetry Streaming & WebSocket Channel Subscriptions
// =====================================================================

const RealtimeTracker = {
    activeChannel: null,
    pollingInterval: null,
    lastReceivedTimestamp: null,

    /**
     * Subscribes to Realtime GPS updates for a specific Bus
     * @param {string} busId - Target vehicle UUID
     * @param {function} onLocationReceived - Callback invoked when new coordinates arrive
     * @param {function} onStatusChange - Callback reporting connection state (CONNECTED, RECONNECTING, ERROR)
     */
    subscribeToBus(busId, onLocationReceived, onStatusChange = () => {}) {
        this.unsubscribe();

        const client = window.getSupabaseClient ? window.getSupabaseClient() : null;

        if (client) {
            onStatusChange('CONNECTING');

            // 1. Establish Supabase Realtime WebSocket Channel
            this.activeChannel = client
                .channel(`realtime-bus-${busId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'bus_locations',
                        filter: `bus_id=eq.${busId}`
                    },
                    (payload) => {
                        const newLoc = payload.new;
                        // Avoid processing duplicate or outdated coordinates
                        if (!this.lastReceivedTimestamp || new Date(newLoc.gps_timestamp) > new Date(this.lastReceivedTimestamp)) {
                            this.lastReceivedTimestamp = newLoc.gps_timestamp;
                            onLocationReceived(newLoc);
                        }
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        onStatusChange('CONNECTED');
                    } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        onStatusChange('RECONNECTING');
                    }
                });
        } else {
            console.warn('Realtime client unconfigured. Operating in adaptive fallback sync mode.');
        }

        // 2. Resilient Fallback Polling (Syncs every 4 seconds if WebSocket encounters intermittent cellular packet loss)
        this.pollingInterval = setInterval(async () => {
            try {
                const res = await api.get(`/locations/latest/${busId}`);
                if (res && res.success && res.location) {
                    const loc = res.location;
                    if (!this.lastReceivedTimestamp || new Date(loc.gps_timestamp) > new Date(this.lastReceivedTimestamp)) {
                        this.lastReceivedTimestamp = loc.gps_timestamp;
                        onLocationReceived(loc);
                    }
                }
            } catch (err) {
                // Silently handle temporary fetch errors
            }
        }, 4000);
    },

    /**
     * Subscribes to all active buses for Administrator Fleet Live Monitoring
     */
    subscribeToFleet(onFleetUpdate, onStatusChange = () => {}) {
        this.unsubscribe();

        const client = window.getSupabaseClient ? window.getSupabaseClient() : null;

        if (client) {
            onStatusChange('CONNECTING');

            this.activeChannel = client
                .channel('realtime-fleet-monitoring')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'bus_locations'
                    },
                    (payload) => {
                        onFleetUpdate(payload.new);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') onStatusChange('CONNECTED');
                    else onStatusChange('RECONNECTING');
                });
        }

        // Polling sync for fleet
        this.pollingInterval = setInterval(async () => {
            try {
                const res = await api.get('/trips/active');
                if (res && res.success && res.trips) {
                    res.trips.forEach(t => {
                        if (t.latest_location) onFleetUpdate(t.latest_location);
                    });
                }
            } catch (e) {}
        }, 5000);
    },

    /**
     * Gracefully cleans up channels and timers
     */
    unsubscribe() {
        if (this.activeChannel && window.getSupabaseClient) {
            const client = window.getSupabaseClient();
            if (client) client.removeChannel(this.activeChannel);
            this.activeChannel = null;
        }

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        this.lastReceivedTimestamp = null;
    }
};

window.RealtimeTracker = RealtimeTracker;
