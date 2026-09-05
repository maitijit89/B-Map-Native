import { Platform } from 'react-native';

export type IndianLanguageCode =
  | 'hi' // Hindi
  | 'en' // English (Indian)
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn' // Kannada
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'as'; // Assamese

export interface IndianLanguageMeta {
  code: IndianLanguageCode;
  name: string;
  nativeName: string;
  bcp47: string;
  script: string;
  sampleQueries: string[];
  listeningPrompt: string;
}

export const INDIAN_LANGUAGES: Record<IndianLanguageCode, IndianLanguageMeta> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    bcp47: 'hi-IN',
    script: 'Devanagari',
    sampleQueries: ['एयरपोर्ट का रास्ता', 'पास का पेट्रोल पंप', 'राजीव चौक मेट्रो', 'फास्टैग टोल'],
    listeningPrompt: 'बोलिए, कहाँ जाना चाहते हैं? (जैसे: "एयरपोर्ट का रास्ता")',
  },
  en: {
    code: 'en',
    name: 'English (India)',
    nativeName: 'English (IN)',
    bcp47: 'en-IN',
    script: 'Latin',
    sampleQueries: ['Route to Airport', 'EV Chargers near CP', 'Metro Yellow Line', 'India Gate'],
    listeningPrompt: 'Speak destination, landmark, or service…',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    bcp47: 'bn-IN',
    script: 'Bengali',
    sampleQueries: ['বিমানবন্দরের পথ', 'কাছের পেট্রোল পাম্প', 'মেট্রো স্টেশন', 'হাসপাতাল'],
    listeningPrompt: 'বলুন, আপনি কোথায় যেতে চান? (যেমন: "বিমানবন্দরের পথ")',
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    bcp47: 'ta-IN',
    script: 'Tamil',
    sampleQueries: ['விமான நிலைய வழி', 'அருகிலுள்ள பெட்ரோல் பங்க்', 'மெட்ரோ நிலையம்', 'மருத்துவமனை'],
    listeningPrompt: 'பேசுங்கள், எங்கு செல்ல வேண்டும்? (எ.கா: "விமான நிலைய வழி")',
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    bcp47: 'te-IN',
    script: 'Telugu',
    sampleQueries: ['విమానాశ్రయం మార్గం', 'సమీప పెట్రోల్ బంక్', 'మెట్రో స్టేషన్', 'ఆసుపత్రి'],
    listeningPrompt: 'చెప్పండి, ఎక్కడికి వెళ్లాలి? (ఉదా: "విమానాశ్రయం మార్గం")',
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    bcp47: 'kn-IN',
    script: 'Kannada',
    sampleQueries: ['ವಿಮಾನ ನಿಲ್ದಾಣದ ದಾರಿ', 'ಹತ್ತಿರದ ಪೆಟ್ರೋಲ್ ಬಂಕ್', 'ಮೆಟ್ರೋ ನಿಲ್ದಾಣ', 'ಇವಿ ಚಾರ್ಜರ್'],
    listeningPrompt: 'ಹೇಳಿ, ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು? (ಉದಾ: "ವಿಮಾನ ನಿಲ್ದಾಣದ ದಾರಿ")',
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    bcp47: 'mr-IN',
    script: 'Devanagari',
    sampleQueries: ['विमानतळाचा रस्ता', 'जवळचा पेट्रोल पंप', 'मेट्रो स्टेशन', 'रुग्णालय'],
    listeningPrompt: 'बोला, कुठे जायचे आहे? (उदा: "विमानतळाचा रस्ता")',
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    bcp47: 'gu-IN',
    script: 'Gujarati',
    sampleQueries: ['એરપોર્ટનો રસ્તો', 'નજીકનું પેટ્રોલ પંપ', 'મેટ્રો સ્ટેશન', 'હોસ્પિટલ'],
    listeningPrompt: 'બોલો, ક્યાં જવું છે? (દા.ત: "એરપોર્ટનો રસ્તો")',
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    bcp47: 'ml-IN',
    script: 'Malayalam',
    sampleQueries: ['എയർപോർട്ട് റൂട്ട്', 'അടുത്തുള്ള പെട്രോൾ പമ്പ്', 'മെട്രോ സ്റ്റേഷൻ', 'ആശുപത്രി'],
    listeningPrompt: 'പറയൂ, എവിടെ പോകണം? (ഉദാ: "എയർപോർട്ട് റൂട്ട്")',
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    bcp47: 'pa-IN',
    script: 'Gurmukhi',
    sampleQueries: ['ਏਅਰਪੋਰਟ ਦਾ ਰਸਤਾ', 'ਨੇੜਲਾ ਪੈਟਰੋਲ ਪੰਪ', 'ਮੈਟਰੋ ਸਟੇਸ਼ਨ', 'ਹਸਪਤਾਲ'],
    listeningPrompt: 'ਬੋਲੋ, ਕਿੱਥੇ ਜਾਣਾ ਚਾਹੁੰਦੇ ਹੋ? (ਜਿਵੇਂ: "ਏਅਰਪੋਰਟ ਦਾ ਰਸਤਾ")',
  },
  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    bcp47: 'or-IN',
    script: 'Odia',
    sampleQueries: ['ବିମାନବନ୍ଦର ରାସ୍ତା', 'ନିକଟସ୍ଥ ପେଟ୍ରୋଲ ପମ୍ପ', 'ମେଟ୍ରୋ ଷ୍ଟେସନ', 'ଡାକ୍ତରଖାନା'],
    listeningPrompt: 'କହନ୍ତୁ, କେଉଁଠାକୁ ଯିବାକୁ ଚାହୁଁଛନ୍ତି? (ଯଥା: "ବିମାନବନ୍ଦର ରାସ୍ତା")',
  },
  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    bcp47: 'as-IN',
    script: 'Bengali-Assamese',
    sampleQueries: ['বিমানবন্দৰৰ পথ', 'ওচৰৰ পেট্ৰ’ল পাম্প', 'মেট্ৰ’ ষ্টেচন', 'চিকিৎসালয়'],
    listeningPrompt: 'কওক, ক’লৈ যাব বিচাৰে? (যেনে: "বিমানবন্দৰৰ পথ")',
  },
};

export const ALL_INDIAN_LANGUAGES = Object.values(INDIAN_LANGUAGES);

/**
 * Automatically detect user's preferred Indian language.
 * Uses a multi-tiered fallback:
 * 1. Coordinates / Region proximity (if latitude/longitude provided)
 * 2. System device locale
 * 3. Default to Hindi ('hi')
 */
export function detectIndianLanguage(coordinates?: { latitude: number; longitude: number }): IndianLanguageCode {
  // 1. Check coordinates if available
  if (coordinates) {
    const { latitude: lat, longitude: lng } = coordinates;
    // Karnataka / Bengaluru
    if (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) return 'kn';
    // Tamil Nadu / Chennai
    if (lat >= 8.0 && lat <= 13.5 && lng >= 76.2 && lng <= 80.4) return 'ta';
    // Telangana / Andhra Pradesh / Hyderabad
    if (lat >= 13.5 && lat <= 19.9 && lng >= 77.0 && lng <= 84.8) return 'te';
    // Maharashtra / Mumbai / Pune
    if (lat >= 15.6 && lat <= 22.0 && lng >= 72.6 && lng <= 80.9) return 'mr';
    // West Bengal / Kolkata
    if (lat >= 21.5 && lat <= 27.2 && lng >= 85.8 && lng <= 89.9) return 'bn';
    // Gujarat / Ahmedabad
    if (lat >= 20.1 && lat <= 24.7 && lng >= 68.1 && lng <= 74.5) return 'gu';
    // Kerala / Kochi
    if (lat >= 8.3 && lat <= 12.8 && lng >= 74.9 && lng <= 77.4) return 'ml';
    // Punjab / Chandigarh
    if (lat >= 29.5 && lat <= 32.5 && lng >= 73.8 && lng <= 76.9) return 'pa';
    // Odisha / Bhubaneswar
    if (lat >= 17.8 && lat <= 22.6 && lng >= 81.4 && lng <= 87.5) return 'or';
    // Assam / Guwahati
    if (lat >= 24.1 && lat <= 28.2 && lng >= 89.7 && lng <= 96.0) return 'as';
    // Delhi / UP / MP / Bihar / Rajasthan / Haryana
    if (lat >= 21.0 && lat <= 31.0 && lng >= 70.0 && lng <= 88.0) return 'hi';
  }

  // 2. Check Device Locale
  try {
    let systemLocale = '';
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      systemLocale = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    } else if (typeof Intl !== 'undefined') {
      systemLocale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    }

    const lower = systemLocale.toLowerCase();
    for (const code of Object.keys(INDIAN_LANGUAGES) as IndianLanguageCode[]) {
      if (lower.startsWith(code)) {
        return code;
      }
    }
  } catch {
    // Non-blocking fallback
  }

  // 3. Default to Hindi (highest regional reach for Indian transit)
  return 'hi';
}

/**
 * Automatically detect Indian language from text script.
 */
export function detectLanguageFromScript(text: string): IndianLanguageCode | null {
  if (!text || text.trim().length === 0) return null;

  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  // Odia
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  // Bengali / Assamese
  if (/[\u0980-\u09FF]/.test(text)) {
    return text.includes('ৰ') || text.includes('ৱ') ? 'as' : 'bn';
  }
  // Devanagari (Hindi or Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    return text.includes('ळ') || text.includes('आहे') ? 'mr' : 'hi';
  }
  // Latin / English
  if (/[a-zA-Z]/.test(text)) return 'en';

  return null;
}
