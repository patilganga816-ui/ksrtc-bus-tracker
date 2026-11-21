-- =====================================================================
-- KSRTC LOCAL BUS TRACKING SYSTEM (Hubballi–Dharwad Region)
-- Additive Migration v2: Multilingual Support, Preferred Language, Localized Stops
-- =====================================================================

-- 1. Add preferred_language column to profiles (Defaults to 'en')
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en' 
CHECK (preferred_language IN ('en', 'kn', 'hi'));

-- 2. Add localized bus stop name columns to bus_stops table
ALTER TABLE bus_stops 
ADD COLUMN IF NOT EXISTS stop_name_kn VARCHAR(150),
ADD COLUMN IF NOT EXISTS stop_name_hi VARCHAR(150);

-- 3. Populate localized names for verified corridor bus stops
UPDATE bus_stops SET 
    stop_name_kn = 'ಹುಬ್ಬಳ್ಳಿ ಸಿಬಿಟಿ (ಹೊಸೂರು)', 
    stop_name_hi = 'हुबली सीबीटी (होसूर)' 
WHERE stop_name ILIKE '%Hubballi CBT%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಹುಬ್ಬಳ್ಳಿ ರೈಲ್ವೆ ನಿಲ್ದಾಣ', 
    stop_name_hi = 'हुबली रेलवे स्टेशन' 
WHERE stop_name ILIKE '%Railway Station%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಕೇಶ್ವಾಪುರ ವೃತ್ತ', 
    stop_name_hi = 'केशवापुर सर्कल' 
WHERE stop_name ILIKE '%Keshwapur%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಬಿವಿಬಿ ಕಾಲೇಜು / ಕೆಎಲ್‌ಇ ಟೆಕ್', 
    stop_name_hi = 'बीवीबी कॉलेज / केएलई टेक' 
WHERE stop_name ILIKE '%BVB College%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಉಣಕಲ್ ಕೆರೆ ಕ್ರಾಸ್', 
    stop_name_hi = 'उणकल झील क्रॉस' 
WHERE stop_name ILIKE '%Unkal Lake%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಬೈರಿದೇವರಕೊಪ್ಪ', 
    stop_name_hi = 'बैरीदेवरकोप्पा' 
WHERE stop_name ILIKE '%Bairidevarkoppa%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಅಮರಗೋಳ ಬಿಆರ್‌ಟಿಎಸ್', 
    stop_name_hi = 'अमरगोल बीआरटीएस' 
WHERE stop_name ILIKE '%Amargol%';

UPDATE bus_stops SET 
    stop_name_kn = 'ನವನಗರ ಬಸ್ ನಿಲ್ದಾಣ', 
    stop_name_hi = 'नवनागर बस स्टॉप' 
WHERE stop_name ILIKE '%Navanagar%';

UPDATE bus_stops SET 
    stop_name_kn = 'ರಾಯಪುರ ಬಿಆರ್‌ಟಿಎಸ್', 
    stop_name_hi = 'रायपूर बीआरटीएस' 
WHERE stop_name ILIKE '%Rayapur%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಸತ್ತೂರು (ಎಸ್‌ಡಿಎಂ ಆಸ್ಪತ್ರೆ)', 
    stop_name_hi = 'सत्तूर (एसडीएम अस्पताल)' 
WHERE stop_name ILIKE '%Sattur%';

UPDATE bus_stops SET 
    stop_name_kn = 'ನವಲೂರು ಬಿಆರ್‌ಟಿಎಸ್', 
    stop_name_hi = 'नवलूर बीआरटीएस' 
WHERE stop_name ILIKE '%Navalur%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಗಾಂಧಿನಗರ ನಿಲ್ದಾಣ', 
    stop_name_hi = 'गांधीनगर स्टॉप' 
WHERE stop_name ILIKE '%Gandhinagar%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಜ್ಯೂಬಿಲಿ ಸರ್ಕಲ್', 
    stop_name_hi = 'जुबली सर्कल' 
WHERE stop_name ILIKE '%Jubilee Circle%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಧಾರವಾಡ ಸಿಬಿಟಿ (ಹಳೆ ಬಸ್ ನಿಲ್ದಾಣ)', 
    stop_name_hi = 'धारवाड़ सीबीटी (पुराना बस स्टैंड)' 
WHERE stop_name ILIKE '%Dharwad CBT%';

UPDATE bus_stops SET 
    stop_name_kn = 'ಕರ್ನಾಟಕ ವಿಶ್ವವಿದ್ಯಾಲಯ (ಕೆಯುಡಿ)', 
    stop_name_hi = 'कर्नाटक विश्वविद्यालय (केयूडी)' 
WHERE stop_name ILIKE '%Karnatak University%';
