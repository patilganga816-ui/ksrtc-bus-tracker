// =====================================================================
// KSRTC Local Bus Tracking System — Multilingual Localization Module (i18n)
// Supports: English (en), Kannada (kn), Hindi (hi)
// =====================================================================

const KSRTC_TRANSLATIONS = {
    en: {
        appName: "KSRTC LOCAL BUS TRACKING",
        passengerPortal: "Passenger Portal • Hubballi–Dharwad",
        unifiedPortal: "Hubballi–Dharwad Transit Division",
        welcomeTitle: "Welcome, {name}! 👋",
        welcomeSub: "Find and track local city buses in real-time across Hubballi & Dharwad.",
        corridorCoverage: "📍 Coverage: Hubballi–Dharwad Corridor",
        
        // Navigation
        navHome: "Home",
        navFavourites: "Favourites",
        navAlerts: "Alerts",
        navAccount: "Account",
        navLogout: "Logout",
        language: "Language",

        // Search Section
        findBusesTitle: "🔍 Find Connecting Buses Between Stops",
        boardingLabel: "Boarding Bus Stop (Source)",
        selectBoardingPlaceholder: "-- Select Boarding Stop --",
        destLabel: "Destination Bus Stop",
        selectDestPlaceholder: "-- Select Destination Stop --",
        swapStopsTitle: "Swap Stops",
        btnSearchBuses: "🚍 Search Available Buses",
        directSearchTitle: "🔢 Or Search Directly by Bus or Route Number",
        directSearchPlaceholder: "e.g. KA-25-F-1001 or 100-HD or Navanagar",
        btnSearch: "Search",

        // Active Fleet Section
        activeFleetTitle: "⚡ Currently Active Fleet Buses",
        loadingFleet: "Loading...",
        noRegisteredBuses: "No registered buses found. Waiting for administrator to configure fleet.",
        btnLiveTrack: "📍 Live Track",
        btnRouteInfo: "Route Info",
        typeLabel: "Type",
        routeLabel: "Route",
        unassigned: "Unassigned",
        statusGpsActive: "● GPS ACTIVE",
        statusTripActive: "TRIP ACTIVE",
        statusIdle: "IDLE",
        registeredBusesCount: "{count} Registered Buses",

        // Search Results Page
        searchResultsTitle: "Bus Search Results",
        modifySearch: "← Modify Search",
        scanningRoutes: "Scanning routes...",
        showingBusesSub: "Showing all scheduled buses whose routes serve this origin and destination",
        noDirectBusesTitle: "No Direct Buses Configured",
        noDirectBusesSub: "No configured KSRTC bus routes currently serve both {from} and {to} in this direction.",
        btnTryAnotherSearch: "Try Another Search",
        busesAvailableBadge: "{count} Bus(es) Available",
        boardingAt: "Boarding At:",
        alightingAt: "Alighting At:",
        btnTrackLiveBus: "📍 Track Live Bus",
        btnRouteStops: "Route Stops",

        // Live Tracking Page
        liveTelemetryTitle: "Live Real-Time Telemetry",
        loadingVehicle: "Loading Vehicle...",
        connectingGps: "Connecting GPS...",
        realSatelliteGps: "REAL SATELLITE GPS",
        simulatedMode: "SIMULATED MODE",
        speedMetric: "Speed",
        lastFixMetric: "Last Fix Received",
        waitingFix: "Waiting...",
        awaitingDriver: "Awaiting driver...",
        boardingStopLbl: "Boarding:",
        destinationStopLbl: "Destination:",
        changeBoardingStop: "Change Boarding Stop:",
        realtimeSync: "Realtime Engine: Synchronizing",
        realtimeActive: "Supabase Realtime: Active (WebSocket)",
        realtimeRecon: "Realtime: Reconnecting...",
        statusLiveGps: "● LIVE GPS ACTIVE",
        statusSimGps: "● SIMULATED GPS",
        statusStaleGps: "STALE GPS SIGNAL (> 2m ago)",
        statusNoSignal: "NO ACTIVE GPS SIGNAL",

        // ETA & Distance Features
        etaTitle: "Estimated Arrival",
        distanceTitle: "Distance to Boarding Stop",
        etaMinutesApprox: "Approx. {min} mins",
        etaArrivingNow: "Arriving now (< 1 min)",
        etaUnavailable: "ETA currently unavailable",
        etaDelayed: "GPS update delayed",
        stopPassed: "Boarding stop already passed",
        distKm: "{dist} km",
        distM: "{dist} m",
        distUnavailable: "Distance unavailable",
        routeBasedDistBadge: "Route path distance",
        straightLineDistBadge: "Approx. straight-line distance",
        etaDisclaimer: "ℹ️ ETA is approximate and subject to road traffic conditions.",
        selectBoardingPrompt: "Select your boarding stop above to calculate ETA & remaining distance.",

        // Route Details Page
        routeDetailsTitle: "Transit Route Corridor",
        backToHome: "← Back to Home",
        loadingRoute: "Loading Route...",
        btnSaveFav: "⭐ Save Favourite",
        btnSavedFav: "✓ In Favourites",
        btnTrackRouteBus: "📍 Track Route Bus",
        sequencedStopsTitle: "🚏 Sequenced Stops ({count})",
        coverageLabel: "Coverage: {coverage} ({source} ➔ {destination})",
        noStopsSequenced: "No stops sequenced for this route yet.",

        // Favourites Page
        favouritesTitle: "⭐ My Favourite Routes & Buses",
        favouritesSub: "Quick-launch live tracking for frequently commuted services",
        btnBrowseBuses: "+ Browse Buses",
        noFavsTitle: "No Saved Favourites Yet",
        noFavsSub: "Bookmark buses or routes to track them in one click.",
        btnExploreRoutes: "Explore Routes",
        btnRemove: "Remove",
        confirmRemoveFav: "Remove this favourite?",

        // Notifications Page
        notificationsTitle: "🔔 Commuter Alerts & Advisories",
        notificationsSub: "Updates regarding Hubballi–Dharwad corridor transit schedules and delays",
        noAlertsTitle: "No Notifications",
        noAlertsSub: "You're all caught up! Real-time alerts will appear here.",
        btnMarkRead: "Mark as Read",
        readBadge: "✓ Read",

        // Account Page
        accountTitle: "Passenger Profile & Settings",
        verifiedPassenger: "Verified Passenger",
        fullNameLabel: "Full Name",
        emailLabel: "Email Address (Immutable)",
        mobileLabel: "10-Digit Mobile Number",
        preferredLanguageLabel: "Preferred Language",
        btnSaveProfile: "Save Profile Changes",
        profileUpdatedSuccess: "Profile updated successfully.",
        divisionalAssistanceTitle: "ℹ️ KSRTC / NWKRTC Divisional Assistance",
        divisionalAssistanceText: "Hubballi–Dharwad City Transport Division<br>Central Bus Stand (CBT), Hosur Road, Hubballi - 580029<br>Helpline: 0836-2345678 • Email: support@nwkrtc.karnataka.gov.in",
        btnSignOutAll: "Sign Out from All Devices",

        // Common & Login
        loginTitle: "Unified Transit Login",
        loginSubtitle: "Select your role to access your dashboard",
        rolePassenger: "Passenger",
        roleDriver: "Driver",
        roleAdmin: "Admin",
        passwordLabel: "Password",
        forgotPasswordLink: "Forgot Password?",
        btnSignInAs: "Sign In as {role}",
        noAccountNotice: "Don't have a passenger account?",
        registerHere: "Register Here",

        // Verified Localized Stop Names (English)
        stops: {
            "Hubballi CBT (Hosur)": "Hubballi CBT (Hosur)",
            "Hubballi Railway Station": "Hubballi Railway Station",
            "Keshwapur Circle": "Keshwapur Circle",
            "BVB College / KLE Tech": "BVB College / KLE Tech",
            "Unkal Lake Cross": "Unkal Lake Cross",
            "Bairidevarkoppa": "Bairidevarkoppa",
            "Amargol BRTS": "Amargol BRTS",
            "Navanagar Bus Stop": "Navanagar Bus Stop",
            "Rayapur BRTS": "Rayapur BRTS",
            "Sattur (SDM Hospital)": "Sattur (SDM Hospital)",
            "Navalur BRTS": "Navalur BRTS",
            "Gandhinagar Stop": "Gandhinagar Stop",
            "Jubilee Circle": "Jubilee Circle",
            "Dharwad CBT (Old Bus Stand)": "Dharwad CBT (Old Bus Stand)",
            "Karnatak University (KUD)": "Karnatak University (KUD)"
        }
    },

    kn: {
        appName: "ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಸ್ಥಳೀಯ ಬಸ್ ಟ್ರ್ಯಾಕಿಂಗ್",
        passengerPortal: "ಪ್ರಯಾಣಿಕರ ಪೋರ್ಟಲ್ • ಹುಬ್ಬಳ್ಳಿ–ಧಾರವಾಡ",
        unifiedPortal: "ಹುಬ್ಬಳ್ಳಿ–ಧಾರವಾಡ ಸಾರಿಗೆ ವಿಭಾಗ",
        welcomeTitle: "ಸ್ವಾಗತ, {name}! 👋",
        welcomeSub: "ಹುಬ್ಬಳ್ಳಿ ಮತ್ತು ಧಾರವಾಡದ ನಗರ ಬಸ್‌ಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಹುಡುಕಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
        corridorCoverage: "📍 ವ್ಯಾಪ್ತಿ: ಹುಬ್ಬಳ್ಳಿ–ಧಾರವಾಡ ಕಾರಿಡಾರ್",

        // Navigation
        navHome: "ಮುಖಪುಟ",
        navFavourites: "ಮೆಚ್ಚಿನವುಗಳು",
        navAlerts: "ಸೂಚನೆಗಳು",
        navAccount: "ಖಾತೆ",
        navLogout: "ಲಾಗ್‌ಔಟ್",
        language: "ಭಾಷೆ",

        // Search Section
        findBusesTitle: "🔍 ನಿಲ್ದಾಣಗಳ ನಡುವೆ ಸಂಪರ್ಕಿಸುವ ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ",
        boardingLabel: "ಹತ್ತುವ ಬಸ್ ನಿಲ್ದಾಣ (ಪ್ರಾರಂಭ)",
        selectBoardingPlaceholder: "-- ಹತ್ತುವ ನಿಲ್ದಾಣವನ್ನು ಆರಿಸಿ --",
        destLabel: "ತಲುಪುವ ಬಸ್ ನಿಲ್ದಾಣ (ಗಮ್ಯಸ್ಥಾನ)",
        selectDestPlaceholder: "-- ತಲುಪುವ ನಿಲ್ದಾಣವನ್ನು ಆರಿಸಿ --",
        swapStopsTitle: "ನಿಲ್ದಾಣಗಳನ್ನು ಅದಲು-ಬದಲು ಮಾಡಿ",
        btnSearchBuses: "🚍 ಲಭ್ಯವಿರುವ ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ",
        directSearchTitle: "🔢 ಅಥವಾ ಬಸ್ ಅಥವಾ ಮಾರ್ಗ ಸಂಖ್ಯೆಯ ಮೂಲಕ ನೇರವಾಗಿ ಹುಡುಕಿ",
        directSearchPlaceholder: "ಉದಾ: KA-25-F-1001 ಅಥವಾ 100-HD ಅಥವಾ ನವನಗರ",
        btnSearch: "ಹುಡುಕಿ",

        // Active Fleet Section
        activeFleetTitle: "⚡ ಪ್ರಸ್ತುತ ಸಂಚರಿಸುತ್ತಿರುವ ಬಸ್‌ಗಳು",
        loadingFleet: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        noRegisteredBuses: "ನೋಂದಾಯಿತ ಬಸ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಆಡಳಿತಾಧಿಕಾರಿಗಳು ಫ್ಲೀಟ್ ಸಂರಚಿಸಲು ಕಾಯಲಾಗುತ್ತಿದೆ.",
        btnLiveTrack: "📍 ಲೈವ್ ಟ್ರ್ಯಾಕ್",
        btnRouteInfo: "ಮಾರ್ಗದ ಮಾಹಿತಿ",
        typeLabel: "ಪ್ರಕಾರ",
        routeLabel: "ಮಾರ್ಗ",
        unassigned: "ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ",
        statusGpsActive: "● ಜಿಪಿಎಸ್ ಸಕ್ರಿಯ",
        statusTripActive: "ಟ್ರಿಪ್ ಸಕ್ರಿಯ",
        statusIdle: "ನಿಷ್ಕ್ರಿಯ",
        registeredBusesCount: "{count} ನೋಂದಾಯಿತ ಬಸ್‌ಗಳು",

        // Search Results Page
        searchResultsTitle: "ಬಸ್ ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು",
        modifySearch: "← ಹುಡುಕಾಟವನ್ನು ಬದಲಿಸಿ",
        scanningRoutes: "ಮಾರ್ಗಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
        showingBusesSub: "ಈ ಪ್ರಾರಂಭ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನದ ನಡುವೆ ಸಂಚರಿಸುವ ಎಲ್ಲಾ ನಿಯೋಜಿತ ಬಸ್‌ಗಳು",
        noDirectBusesTitle: "ನೇರ ಬಸ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ",
        noDirectBusesSub: "{from} ಮತ್ತು {to} ನಡುವೆ ಈ ದಿಕ್ಕಿನಲ್ಲಿ ಯಾವುದೇ ನೇರ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಬಸ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ.",
        btnTryAnotherSearch: "ಮತ್ತೊಂದು ಹುಡುಕಾಟ ಪ್ರಯತ್ನಿಸಿ",
        busesAvailableBadge: "{count} ಬಸ್‌ಗಳು ಲಭ್ಯವಿದೆ",
        boardingAt: "ಹತ್ತುವ ನಿಲ್ದಾಣ:",
        alightingAt: "ಇಳಿಯುವ ನಿಲ್ದಾಣ:",
        btnTrackLiveBus: "📍 ಬಸ್ ಲೈವ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
        btnRouteStops: "ಮಾರ್ಗದ ನಿಲ್ದಾಣಗಳು",

        // Live Tracking Page
        liveTelemetryTitle: "ನೈಜ ಸಮಯದ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್",
        loadingVehicle: "ವಾಹನದ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
        connectingGps: "ಜಿಪಿಎಸ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",
        realSatelliteGps: "ನೈಜ ಸ್ಯಾಟಲೈಟ್ ಜಿಪಿಎಸ್",
        simulatedMode: "ಸಿಮ್ಯುಲೇಟೆಡ್ ಮೋಡ್",
        speedMetric: "ವೇಗ",
        lastFixMetric: "ಕೊನೆಯ ಜಿಪಿಎಸ್ ಅಪ್‌ಡೇಟ್",
        waitingFix: "ಕಾಯಲಾಗುತ್ತಿದೆ...",
        awaitingDriver: "ಚಾಲಕನ ಸಿಗ್ನಲ್‌ಗಾಗಿ ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ...",
        boardingStopLbl: "ಹತ್ತುವ ನಿಲ್ದಾಣ:",
        destinationStopLbl: "ಗಮ್ಯಸ್ಥಾನ:",
        changeBoardingStop: "ಹತ್ತುವ ನಿಲ್ದಾಣ ಬದಲಿಸಿ:",
        realtimeSync: "ನೈಜ ಸಮಯ: ಸಿಂಕ್ರೊನೈಸ್ ಆಗುತ್ತಿದೆ",
        realtimeActive: "ಸುಪಬೇಸ್ ರಿಯಲ್‌ಟೈಮ್: ಸಕ್ರಿಯ (ವೆಬ್‌ಸಾಕೆಟ್)",
        realtimeRecon: "ಮರುಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",
        statusLiveGps: "● ಲೈವ್ ಜಿಪಿಎಸ್ ಸಕ್ರಿಯ",
        statusSimGps: "● ಸಿಮ್ಯುಲೇಟೆಡ್ ಜಿಪಿಎಸ್",
        statusStaleGps: "ಹಳೆಯ ಜಿಪಿಎಸ್ ಸಿಗ್ನಲ್ (> 2 ನಿಮಿಷ)",
        statusNoSignal: "ಜಿಪಿಎಸ್ ಸಿಗ್ನಲ್ ಲಭ್ಯವಿಲ್ಲ",

        // ETA & Distance Features
        etaTitle: "ಅಂದಾಜು ಆಗಮನ ಸಮಯ",
        distanceTitle: "ಹತ್ತುವ ನಿಲ್ದಾಣಕ್ಕೆ ಇರುವ ದೂರ",
        etaMinutesApprox: "ಸುಮಾರು {min} ನಿಮಿಷಗಳು",
        etaArrivingNow: "ಈಗಲೇ ಆಗಮಿಸುತ್ತಿದೆ (< 1 ನಿಮಿಷ)",
        etaUnavailable: "ಅಂದಾಜು ಸಮಯ ಲಭ್ಯವಿಲ್ಲ",
        etaDelayed: "ಜಿಪಿಎಸ್ ಅಪ್‌ಡೇಟ್ ವಿಳಂಬವಾಗಿದೆ",
        stopPassed: "ಹತ್ತುವ ನಿಲ್ದಾಣವನ್ನು ದಾಟಿದೆ",
        distKm: "{dist} ಕಿ.ಮೀ",
        distM: "{dist} ಮೀಟರ್",
        distUnavailable: "ದೂರ ಲಭ್ಯವಿಲ್ಲ",
        routeBasedDistBadge: "ಮಾರ್ಗ ಆಧಾರಿತ ನಿಖರ ದೂರ",
        straightLineDistBadge: "ಅಂದಾಜು ನೇರ ರೇಖೆಯ ದೂರ",
        etaDisclaimer: "ℹ️ ಅಂದಾಜು ಸಮಯವು ರಸ್ತೆ ಟ್ರಾಫಿಕ್ ಪರಿಸ್ಥಿತಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.",
        selectBoardingPrompt: "ದೂರ ಮತ್ತು ಅಂದಾಜು ಸಮಯ ನೋಡಲು ನಿಮ್ಮ ಹತ್ತುವ ನಿಲ್ದಾಣವನ್ನು ಆರಿಸಿ.",

        // Route Details Page
        routeDetailsTitle: "ಸಾರಿಗೆ ಮಾರ್ಗದ ವಿವರ",
        backToHome: "← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
        loadingRoute: "ಮಾರ್ಗ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        btnSaveFav: "⭐ ಮೆಚ್ಚಿನವುಗಳಿಗೆ ಸೇರಿಸಿ",
        btnSavedFav: "✓ ಮೆಚ್ಚಿನವುಗಳಲ್ಲಿದೆ",
        btnTrackRouteBus: "📍 ಮಾರ್ಗದ ಬಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
        sequencedStopsTitle: "🚏 ಅನುಕ್ರಮ ನಿಲ್ದಾಣಗಳು ({count})",
        coverageLabel: "ವ್ಯಾಪ್ತಿ: {coverage} ({source} ➔ {destination})",
        noStopsSequenced: "ಈ ಮಾರ್ಗಕ್ಕೆ ಇನ್ನೂ ಯಾವುದೇ ನಿಲ್ದಾಣಗಳನ್ನು ನಿಗದಿಪಡಿಸಿಲ್ಲ.",

        // Favourites Page
        favouritesTitle: "⭐ ನನ್ನ ಮೆಚ್ಚಿನ ಮಾರ್ಗಗಳು & ಬಸ್‌ಗಳು",
        favouritesSub: "ಪ್ರತಿದಿನ ಪ್ರಯಾಣಿಸುವ ಬಸ್‌ಗಳನ್ನು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸುಲಭವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
        btnBrowseBuses: "+ ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ",
        noFavsTitle: "ಇನ್ನೂ ಯಾವುದೇ ಮೆಚ್ಚಿನವುಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ",
        noFavsSub: "ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಬಸ್‌ಗಳನ್ನು ಅಥವಾ ಮಾರ್ಗಗಳನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ.",
        btnExploreRoutes: "ಮಾರ್ಗಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
        btnRemove: "ತೆಗೆದುಹಾಕಿ",
        confirmRemoveFav: "ಈ ಮೆಚ್ಚಿನವನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?",

        // Notifications Page
        notificationsTitle: "🔔 ಸಾರಿಗೆ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು",
        notificationsSub: "ಹುಬ್ಬಳ್ಳಿ–ಧಾರವಾಡ ಕಾರಿಡಾರ್ ಸಾರಿಗೆ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ವಿಳಂಬದ ಕುರಿತು ತಾಜಾ ಮಾಹಿತಿ",
        noAlertsTitle: "ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ",
        noAlertsSub: "ಎಲ್ಲವೂ ನವೀಕೃತವಾಗಿದೆ! ನೈಜ ಸಮಯದ ಎಚ್ಚರಿಕೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
        btnMarkRead: "ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
        readBadge: "✓ ಓದಲಾಗಿದೆ",

        // Account Page
        accountTitle: "ಪ್ರಯಾಣಿಕರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        verifiedPassenger: "ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕ",
        fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು",
        emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ (ಬದಲಾಯಿಸಲಾಗದು)",
        mobileLabel: "10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
        preferredLanguageLabel: "ಆದ್ಯತೆಯ ಭಾಷೆ",
        btnSaveProfile: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        profileUpdatedSuccess: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
        divisionalAssistanceTitle: "ℹ️ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ / ವಾಕರಸಾಸಂ ವಿಭಾಗೀಯ ಸಹಾಯ",
        divisionalAssistanceText: "ಹುಬ್ಬಳ್ಳಿ–ಧಾರವಾಡ ನಗರ ಸಾರಿಗೆ ವಿಭಾಗ<br>ಕೇಂದ್ರ ಬಸ್ ನಿಲ್ದಾಣ (ಸಿಬಿಟಿ), ಹೊಸೂರು ರಸ್ತೆ, ಹುಬ್ಬಳ್ಳಿ - 580029<br>ಸಹಾಯವಾಣಿ: 0836-2345678 • ಇಮೇಲ್: support@nwkrtc.karnataka.gov.in",
        btnSignOutAll: "ಎಲ್ಲಾ ಸಾಧನಗಳಿಂದ ಸೈನ್ ಔಟ್ ಮಾಡಿ",

        // Common & Login
        loginTitle: "ಏಕೀಕೃತ ಸಾರಿಗೆ ಲಾಗಿನ್",
        loginSubtitle: "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        rolePassenger: "ಪ್ರಯಾಣಿಕ",
        roleDriver: "ಚಾಲಕ",
        roleAdmin: "ನಿರ್ವಾಹಕ",
        passwordLabel: "ಪಾಸ್‌ವರ್ಡ್",
        forgotPasswordLink: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
        btnSignInAs: "{role} ಆಗಿ ಲಾಗಿನ್ ಆಗಿ",
        noAccountNotice: "ಪ್ರಯಾಣಿಕರ ಖಾತೆ ಇಲ್ಲವೇ?",
        registerHere: "ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ",

        // Verified Localized Stop Names (Kannada)
        stops: {
            "Hubballi CBT (Hosur)": "ಹುಬ್ಬಳ್ಳಿ ಸಿಬಿಟಿ (ಹೊಸೂರು)",
            "Hubballi Railway Station": "ಹುಬ್ಬಳ್ಳಿ ರೈಲ್ವೆ ನಿಲ್ದಾಣ",
            "Keshwapur Circle": "ಕೇಶ್ವಾಪುರ ವೃತ್ತ",
            "BVB College / KLE Tech": "ಬಿವಿಬಿ ಕಾಲೇಜು / ಕೆಎಲ್‌ಇ ಟೆಕ್",
            "Unkal Lake Cross": "ಉಣಕಲ್ ಕೆರೆ ಕ್ರಾಸ್",
            "Bairidevarkoppa": "ಬೈರಿದೇವರಕೊಪ್ಪ",
            "Amargol BRTS": "ಅಮರಗೋಳ ಬಿಆರ್‌ಟಿಎಸ್",
            "Navanagar Bus Stop": "ನವನಗರ ಬಸ್ ನಿಲ್ದಾಣ",
            "Rayapur BRTS": "ರಾಯಪುರ ಬಿಆರ್‌ಟಿಎಸ್",
            "Sattur (SDM Hospital)": "ಸತ್ತೂರು (ಎಸ್‌ಡಿಎಂ ಆಸ್ಪತ್ರೆ)",
            "Navalur BRTS": "ನವಲೂರು ಬಿಆರ್‌ಟಿಎಸ್",
            "Gandhinagar Stop": "ಗಾಂಧಿನಗರ ನಿಲ್ದಾಣ",
            "Jubilee Circle": "ಜ್ಯೂಬಿಲಿ ಸರ್ಕಲ್",
            "Dharwad CBT (Old Bus Stand)": "ಧಾರವಾಡ ಸಿಬಿಟಿ (ಹಳೆ ಬಸ್ ನಿಲ್ದಾಣ)",
            "Karnatak University (KUD)": "ಕರ್ನಾಟಕ ವಿಶ್ವವಿದ್ಯಾಲಯ (ಕೆಯುಡಿ)"
        }
    },

    hi: {
        appName: "केएसआरटीसी स्थानीय बस ट्रैकिंग",
        passengerPortal: "यात्री पोर्टल • हुबली–धारवाड़",
        unifiedPortal: "हुबली–धारवाड़ परिवहन प्रभाग",
        welcomeTitle: "स्वागत है, {name}! 👋",
        welcomeSub: "हुबली और धारवाड़ में वास्तविक समय में स्थानीय सिटी बसों को खोजें और ट्रैक करें।",
        corridorCoverage: "📍 कवरेज: हुबली–धारवाड़ कॉरिडोर",

        // Navigation
        navHome: "होम",
        navFavourites: "पसंदीदा",
        navAlerts: "अलर्ट",
        navAccount: "खाता",
        navLogout: "लॉगआउट",
        language: "भाषा",

        // Search Section
        findBusesTitle: "🔍 स्टॉप्स के बीच कनेक्टिंग बसें खोजें",
        boardingLabel: "बोर्डिंग बस स्टॉप (प्रारंभिक)",
        selectBoardingPlaceholder: "-- बोर्डिंग स्टॉप चुनें --",
        destLabel: "गंतव्य बस स्टॉप",
        selectDestPlaceholder: "-- गंतव्य स्टॉप चुनें --",
        swapStopsTitle: "स्टॉप्स बदलें",
        btnSearchBuses: "🚍 उपलब्ध बसें खोजें",
        directSearchTitle: "🔢 या सीधे बस या रूट नंबर से खोजें",
        directSearchPlaceholder: "उदा: KA-25-F-1001 या 100-HD या नवनागर",
        btnSearch: "खोजें",

        // Active Fleet Section
        activeFleetTitle: "⚡ वर्तमान में सक्रिय बसें",
        loadingFleet: "लोड हो रहा है...",
        noRegisteredBuses: "कोई पंजीकृत बस नहीं मिली। व्यवस्थापक द्वारा बेड़े के विन्यास की प्रतीक्षा है।",
        btnLiveTrack: "📍 लाइव ट्रैक",
        btnRouteInfo: "रूट की जानकारी",
        typeLabel: "प्रकार",
        routeLabel: "रूट",
        unassigned: "अनसाइंड",
        statusGpsActive: "● जीपीएस सक्रिय",
        statusTripActive: "ट्रिप सक्रिय",
        statusIdle: "निष्क्रिय",
        registeredBusesCount: "{count} पंजीकृत बसें",

        // Search Results Page
        searchResultsTitle: "बस खोज परिणाम",
        modifySearch: "← खोज बदलें",
        scanningRoutes: "रूटों की जाँच की जा रही है...",
        showingBusesSub: "इस प्रारंभिक और गंतव्य स्थल के बीच चलने वाली सभी निर्धारित बसें",
        noDirectBusesTitle: "कोई सीधी बस उपलब्ध नहीं है",
        noDirectBusesSub: "{from} और {to} के बीच इस दिशा में कोई सीधी केएसआरटीसी बस सेवा उपलब्ध नहीं है।",
        btnTryAnotherSearch: "दूसरी खोज का प्रयास करें",
        busesAvailableBadge: "{count} बसें उपलब्ध",
        boardingAt: "बोर्डिंग स्टॉप:",
        alightingAt: "उतरने का स्टॉप:",
        btnTrackLiveBus: "📍 लाइव बस ट्रैक करें",
        btnRouteStops: "रूट स्टॉप्स",

        // Live Tracking Page
        liveTelemetryTitle: "लाइव रियल-टाइम टेलीमेट्री",
        loadingVehicle: "वाहन लोड हो रहा है...",
        connectingGps: "जीपीएस कनेक्ट हो रहा है...",
        realSatelliteGps: "वास्तविक सैटेलाइट जीपीएस",
        simulatedMode: "सिम्युलेटेड मोड",
        speedMetric: "गति",
        lastFixMetric: "अंतिम जीपीएस अपडेट",
        waitingFix: "प्रतीक्षा में...",
        awaitingDriver: "चालक सिग्नल की प्रतीक्षा...",
        boardingStopLbl: "बोर्डिंग:",
        destinationStopLbl: "गंतव्य:",
        changeBoardingStop: "बोर्डिंग स्टॉप बदलें:",
        realtimeSync: "रियलटाइम: सिंक्रोनाइज़ हो रहा है",
        realtimeActive: "सुपाबेस रियलटाइम: सक्रिय (वेबसोकेट)",
        realtimeRecon: "पुनः कनेक्ट हो रहा है...",
        statusLiveGps: "● लाइव जीपीएस सक्रिय",
        statusSimGps: "● सिम्युलेटेड जीपीएस",
        statusStaleGps: "पुराना जीपीएस सिग्नल (> 2 मिनट)",
        statusNoSignal: "जीपीएस सिग्नल उपलब्ध नहीं",

        // ETA & Distance Features
        etaTitle: "अनुमानित आगमन समय",
        distanceTitle: "बोर्डिंग स्टॉप की दूरी",
        etaMinutesApprox: "लगभग {min} मिनट",
        etaArrivingNow: "अभी पहुंच रही है (< 1 मिनट)",
        etaUnavailable: "अनुमानित समय उपलब्ध नहीं है",
        etaDelayed: "जीपीएस अपडेट में देरी",
        stopPassed: "बोर्डिंग स्टॉप पहले ही पार हो चुका है",
        distKm: "{dist} किमी",
        distM: "{dist} मीटर",
        distUnavailable: "दूरी उपलब्ध नहीं है",
        routeBasedDistBadge: "रूट आधारित वास्तविक दूरी",
        straightLineDistBadge: "अनुमानित सीधी रेखा दूरी",
        etaDisclaimer: "ℹ️ अनुमानित समय सड़क ट्रैफ़िक की स्थिति पर निर्भर करता है।",
        selectBoardingPrompt: "दूरी और अनुमानित आगमन समय जानने के लिए ऊपर अपना बोर्डिंग स्टॉप चुनें।",

        // Route Details Page
        routeDetailsTitle: "परिवहन रूट का विवरण",
        backToHome: "← होम पर वापस जाएं",
        loadingRoute: "रूट लोड हो रहा है...",
        btnSaveFav: "⭐ पसंदीदा में सहेजें",
        btnSavedFav: "✓ पसंदीदा में सहेजा गया",
        btnTrackRouteBus: "📍 रूट बस ट्रैक करें",
        sequencedStopsTitle: "🚏 क्रमबद्ध स्टॉप्स ({count})",
        coverageLabel: "कवरेज: {coverage} ({source} ➔ {destination})",
        noStopsSequenced: "इस रूट के लिए अभी कोई स्टॉप क्रमबद्ध नहीं किया गया है।",

        // Favourites Page
        favouritesTitle: "⭐ मेरे पसंदीदा रूट और बसें",
        favouritesSub: "नियमित यात्रा वाली बसों को एक क्लिक में आसानी से ट्रैक करें",
        btnBrowseBuses: "+ बसें खोजें",
        noFavsTitle: "अभी कोई पसंदीदा बस नहीं जोड़ी गई",
        noFavsSub: "एक क्लिक में ट्रैक करने के लिए बसों या रूटों को बुकमार्क करें।",
        btnExploreRoutes: "रूट देखें",
        btnRemove: "हटाएं",
        confirmRemoveFav: "क्या आप इस पसंदीदा को हटाना चाहते हैं?",

        // Notifications Page
        notificationsTitle: "🔔 यात्री सूचनाएं और अलर्ट",
        notificationsSub: "हुबली–धारवाड़ कॉरिडोर समय सारिणी और देरी के संबंध में नवीनतम जानकारी",
        noAlertsTitle: "कोई सूचना नहीं है",
        noAlertsSub: "सब कुछ अप टू डेट है! वास्तविक समय के अलर्ट यहां दिखाई देंगे।",
        btnMarkRead: "पढ़ा हुआ मार्क करें",
        readBadge: "✓ पढ़ा हुआ",

        // Account Page
        accountTitle: "यात्री प्रोफ़ाइल और सेटिंग्स",
        verifiedPassenger: "सत्यापित यात्री",
        fullNameLabel: "पूरा नाम",
        emailLabel: "ईमेल पता (अपरिवर्तनीय)",
        mobileLabel: "10-अंकों का मोबाइल नंबर",
        preferredLanguageLabel: "पसंदीदा भाषा",
        btnSaveProfile: "परिवर्तन सहेजें",
        profileUpdatedSuccess: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।",
        divisionalAssistanceTitle: "ℹ️ केएसआरटीसी / एनडब्ल्यूकेआरटीसी मंडल सहायता",
        divisionalAssistanceText: "हुबली–धारवाड़ सिटी ट्रांसपोर्ट डिवीजन<br>सेंट्रल बस स्टैंड (सीबीटी), होसूर रोड, हुबली - 580029<br>हेल्पलाइन: 0836-2345678 • ईमेल: support@nwkrtc.karnataka.gov.in",
        btnSignOutAll: "सभी उपकरणों से साइन आउट करें",

        // Common & Login
        loginTitle: "एकीकृत परिवहन लॉगिन",
        loginSubtitle: "अपने डैशबोर्ड तक पहुँचने के लिए अपनी भूमिका चुनें",
        rolePassenger: "यात्री",
        roleDriver: "चालक",
        roleAdmin: "व्यवस्थापक",
        passwordLabel: "पासवर्ड",
        forgotPasswordLink: "पासवर्ड भूल गए?",
        btnSignInAs: "{role} के रूप में लॉगिन करें",
        noAccountNotice: "क्या आपके पास यात्री खाता नहीं है?",
        registerHere: "यहाँ पंजीकरण करें",

        // Verified Localized Stop Names (Hindi)
        stops: {
            "Hubballi CBT (Hosur)": "हुबली सीबीटी (होसूर)",
            "Hubballi Railway Station": "हुबली रेलवे स्टेशन",
            "Keshwapur Circle": "केशवापुर सर्कल",
            "BVB College / KLE Tech": "बीवीबी कॉलेज / केएलई टेक",
            "Unkal Lake Cross": "उणकल झील क्रॉस",
            "Bairidevarkoppa": "बैरीदेवरकोप्पा",
            "Amargol BRTS": "अमरगोल बीआरटीएस",
            "Navanagar Bus Stop": "नवनागर बस स्टॉप",
            "Rayapur BRTS": "रायपूर बीआरटीएस",
            "Sattur (SDM Hospital)": "सत्तूर (एसडीएम अस्पताल)",
            "Navalur BRTS": "नवलूर बीआरटीएस",
            "Gandhinagar Stop": "गांधीनगर स्टॉप",
            "Jubilee Circle": "जुबली सर्कल",
            "Dharwad CBT (Old Bus Stand)": "धारवाड़ सीबीटी (पुराना बस स्टैंड)",
            "Karnatak University (KUD)": "कर्नाटक विश्वविद्यालय (केयूडी)"
        }
    }
};

const i18n = {
    currentLang: 'en',

    init() {
        const stored = localStorage.getItem('ksrtc_language');
        if (stored && ['en', 'kn', 'hi'].includes(stored)) {
            this.currentLang = stored;
        } else {
            this.currentLang = 'en';
        }
        this.renderLanguageSelector();
        this.applyTranslations();
    },

    getLanguage() {
        return this.currentLang || 'en';
    },

    setLanguage(lang) {
        if (!['en', 'kn', 'hi'].includes(lang)) return;
        this.currentLang = lang;
        localStorage.setItem('ksrtc_language', lang);

        // Update selector dropdown if present
        const selectors = document.querySelectorAll('.ksrtc-lang-select');
        selectors.forEach(sel => { sel.value = lang; });

        // Update user profile preference on backend if logged in
        if (window.api && api.getToken()) {
            api.put('/passengers/language', { preferred_language: lang }).catch(() => {});
        }

        this.applyTranslations();

        // Dispatch language change event for dynamic components (charts, Leaflet popups, ETA/Distance cards)
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            const event = typeof CustomEvent === 'function' 
                ? new CustomEvent('ksrtc:languageChanged', { detail: { language: lang } })
                : { type: 'ksrtc:languageChanged', detail: { language: lang } };
            window.dispatchEvent(event);
        }
    },

    t(key, params = {}) {
        const langDict = KSRTC_TRANSLATIONS[this.currentLang] || KSRTC_TRANSLATIONS['en'];
        let text = langDict[key] || KSRTC_TRANSLATIONS['en'][key] || key;

        // Replace interpolation tokens like {name}, {count}, {min}, etc.
        Object.keys(params).forEach(p => {
            text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
        });

        return text;
    },

    getStopName(englishName) {
        if (!englishName) return '';
        const langDict = KSRTC_TRANSLATIONS[this.currentLang] || KSRTC_TRANSLATIONS['en'];
        if (langDict.stops && langDict.stops[englishName]) {
            return langDict.stops[englishName];
        }
        return englishName;
    },

    applyTranslations() {
        document.documentElement.lang = this.currentLang;

        // 1. Text elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                // Check if element has HTML tags in translation
                if (translation.includes('<br>') || translation.includes('<strong>') || translation.includes('<span>')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // 2. Input placeholders with data-i18n-ph
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            const translation = this.t(key);
            if (translation) el.placeholder = translation;
        });

        // 3. Elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation) el.title = translation;
        });
    },

    /**
     * Renders or injects the language selector in the header navigation
     */
    renderLanguageSelector() {
        // If an existing container with id ksrtc-lang-container exists, populate it
        const containers = document.querySelectorAll('.ksrtc-lang-container');
        containers.forEach(container => {
            container.innerHTML = `
                <select class="ksrtc-lang-select" onchange="i18n.setLanguage(this.value)" title="Choose Language / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ / भाषा चुनें" style="background: rgba(255, 255, 255, 0.15); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.4); padding: 5px 10px; border-radius: var(--radius-sm); font-size: 0.82rem; cursor: pointer; outline: none; font-weight: 500;">
                    <option value="en" ${this.currentLang === 'en' ? 'selected' : ''} style="color: #0f172a; background: #ffffff;">English</option>
                    <option value="kn" ${this.currentLang === 'kn' ? 'selected' : ''} style="color: #0f172a; background: #ffffff;">ಕನ್ನಡ (Kannada)</option>
                    <option value="hi" ${this.currentLang === 'hi' ? 'selected' : ''} style="color: #0f172a; background: #ffffff;">हिन्दी (Hindi)</option>
                </select>
            `;
        });
    }
};

if (typeof window !== 'undefined') {
    window.i18n = i18n;
    window.KSRTC_TRANSLATIONS = KSRTC_TRANSLATIONS;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { i18n, KSRTC_TRANSLATIONS };
}

// Initialize on DOM load if document is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => i18n.init());
    } else {
        i18n.init();
    }
}
