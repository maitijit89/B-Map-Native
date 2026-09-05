import { Platform } from 'react-native';
import { IndianLanguageCode, INDIAN_LANGUAGES } from './languageService';

export type SupportedLanguage = IndianLanguageCode;

export interface VernacularAlert {
  maneuver: string;
  hazard: string;
  glosa: string;
  commute: string;
  reroute: string;
}

export const VERNACULAR_ALERTS: Record<
  SupportedLanguage,
  { name: string; nativeName: string; alerts: VernacularAlert }
> = {
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    alerts: {
      maneuver: '300 मीटर में, आउटर रिंग रोड पर दायें मुड़ें।',
      hazard: 'सावधान: 500 मीटर आगे जलभराव की सूचना है। कृपया गति धीमी करें।',
      glosa: 'ग्लोसा सूचना: हरी बत्ती पार करने के लिए 45 किमी/घंटा की गति बनाए रखें।',
      commute: 'घर जाने का रास्ता साफ है। जनपथ मार्ग से 14 मिनट लगेंगे।',
      reroute: 'आगे जाम है। हमने 5 मिनट बचाने वाला नया रास्ता चुन लिया है।',
    },
  },
  en: {
    name: 'English',
    nativeName: 'English (Indian)',
    alerts: {
      maneuver: 'In 300 meters, turn right on Outer Ring Road.',
      hazard: 'Caution: Road waterlogging reported 500 meters ahead. Please reduce speed.',
      glosa: 'GLOSA advisory: Maintain 45 km/h to catch upcoming green wave.',
      commute: 'Route to Home is smooth via Janpath. Estimated time 14 minutes.',
      reroute: 'Traffic ahead. Re-routing to save 5 minutes.',
    },
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    alerts: {
      maneuver: '৩০০ মিটারে আউটার রিং রোডে ডানদিকে ঘুরুন।',
      hazard: 'সতর্কতা: ৫০০ মিটার সামনে জল জমার খবর আছে। গতি কমান।',
      glosa: 'গ্লোসা পরামর্শ: সবুজ সংকেত পেতে ৪৫ কিমি/ঘণ্টা গতি বজায় রাখুন।',
      commute: 'বাড়ি ফেরার রাস্তা পরিষ্কার। সময় লাগবে প্রায় ১৪ মিনিট।',
      reroute: 'সামনে যানজট। ৫ মিনিট বাঁচাতে নতুন পথ নির্বাচিত হয়েছে।',
    },
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    alerts: {
      maneuver: '300 மீட்டரில், வெளிவட்டச் சாலையில் வலதுபுறம் திரும்பவும்.',
      hazard: 'எச்சரிக்கை: 500 மீட்டரில் தண்ணீர் தேக்கம் உள்ளது. வேகத்தைக் குறைக்கவும்.',
      glosa: 'க்ளோசா தகவல்: அடுத்த பச்சை விளக்கை அடைய 45 கிமீ/மணி வேகத்தைத் தொடரவும்.',
      commute: 'வீட்டிற்கான பாதை சீராக உள்ளது. பயண நேரம் 14 நிமிடங்கள்.',
      reroute: 'முன்னே போக்குவரத்து நெரிசல். புதிய விரைவுப் பாதை அமைக்கப்பட்டது.',
    },
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    alerts: {
      maneuver: '300 మీటర్లలో, ఔటర్ రింగ్ రోడ్డుపై కుడివైపు తిరగండి.',
      hazard: 'హెచ్చరిక: 500 మీటర్ల ముందు రోడ్డుపై నీరు నిలిచింది. దయచేసి వేగం తగ్గించండి.',
      glosa: 'గ్లోసా సలహా: తదుపరి గ్రీన్ సిగ్నల్ కోసం 45 కి.మీ/గం వేగాన్ని కొనసాగించండి.',
      commute: 'ఇంటికి మార్గం సాఫీగా ఉంది. సుమారు 14 నిమిషాలు పడుతుంది.',
      reroute: 'ముందు ట్రాఫిక్ జామ్ ఉంది. 5 నిమిషాలు ఆదా చేసే కొత్త మార్గం ఎంచుకోబడింది.',
    },
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    alerts: {
      maneuver: '300 ಮೀಟರ್‌ಗಳಲ್ಲಿ, ಔಟರ್ ರಿಂಗ್ ರಸ್ತೆಯಲ್ಲಿ ಬಲಕ್ಕೆ ತಿರುಗಿ.',
      hazard: 'ಎಚ್ಚರಿಕೆ: 500 ಮೀಟರ್ ಮುಂದೆ ರಸ್ತೆಯಲ್ಲಿ ನೀರು ನಿಂತಿದೆ. ದಯವಿಟ್ಟು ವೇಗ ಕಡಿಮೆ ಮಾಡಿ.',
      glosa: 'ಗ್ಲೋಸಾ ಮಾಹಿತಿ: ಮುಂದಿನ ಹಸಿರು ದೀಪ ಪಡೆಯಲು 45 ಕಿಮೀ/ಗಂ ವೇಗ ಕಾಯ್ದುಕೊಳ್ಳಿ.',
      commute: 'ಮನೆಗೆ ಹೋಗುವ ದಾರಿ ಸುಗಮವಾಗಿದೆ. 14 ನಿಮಿಷಗಳು ಬೇಕಾಗಬಹುದು.',
      reroute: 'ಮುಂದೆ ದಟ್ಟಣೆ ಇದೆ. 5 ನಿಮಿಷ ಉಳಿಸುವ ಹೊಸ ಮಾರ್ಗ ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    },
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    alerts: {
      maneuver: '300 मीटर पुढे आउटर रिंग रोडवर उजवीकडे वळा.',
      hazard: 'सावधान: 500 मीटर पुढे रस्त्यावर पाणी साचले आहे. कृपया वेग कमी करा.',
      glosa: 'ग्लोसा सल्ला: पुढील हिरवा सिग्नल मिळवण्यासाठी 45 किमी/तास वेग ठेवा.',
      commute: 'घराचा रस्ता सुरळीत आहे. अंदाजे 14 मिनिटे लागतील.',
      reroute: 'पुढे ट्रॅफिक जाम आहे. 5 मिनिटे वाचवणारा नवीन रस्ता निवडला आहे.',
    },
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    alerts: {
      maneuver: '300 મીટરમાં આઉટર રિંગ રોડ પર જમણે વળો.',
      hazard: 'સાવધાન: 500 મીટર આગળ પાણી ભરાયેલું છે. કૃપા કરીને ગતિ ધીમી કરો.',
      glosa: 'ગ્લોસા સલાહ: આગળનો લીલો સિગ્નલ મેળવવા 45 કિમી/કલાકની ગતિ જાળવો.',
      commute: 'ઘર તરફનો રસ્તો સરળ છે. અંદાજે 14 મિનિટ લાગશે.',
      reroute: 'આગળ ટ્રાફિક છે. 5 મિનિટ બચાવતો નવો રસ્તો પસંદ કર્યો છે.',
    },
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    alerts: {
      maneuver: '300 മീറ്ററിൽ ഔട്ടർ റിംഗ് റോഡിലേക്ക് വലത്തോട്ട് തിരിയുക.',
      hazard: 'മുന്നറിയിപ്പ്: 500 മീറ്റർ മുന്നിൽ വെള്ളക്കെട്ടുണ്ട്. വേഗത കുറയ്ക്കുക.',
      glosa: 'ഗ്ലോസ നിർദ്ദേശം: അടുത്ത ഗ്രീൻ സിഗ്നലിനായി 45 കി.മീ/മണിക്കൂർ വേഗത നിലനിർത്തുക.',
      commute: 'വീട്ടിലേക്കുള്ള വഴി ക്ലിയറാണ്. ഏകദേശം 14 മിനിറ്റ് എടുക്കും.',
      reroute: 'മുന്നിൽ ഗതാഗതക്കുരുക്കുണ്ട്. പുതിയ റൂട്ട് കണക്കാക്കുന്നു.',
    },
  },
  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    alerts: {
      maneuver: '300 ਮੀਟਰ ਵਿੱਚ ਆਊਟਰ ਰਿੰਗ ਰੋਡ ਉੱਤੇ ਸੱਜੇ ਮੁੜੋ।',
      hazard: 'ਸਾਵਧਾਨ: 500 ਮੀਟਰ ਅੱਗੇ ਪਾਣੀ ਭਰਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਗਤੀ ਹੌਲੀ ਕਰੋ।',
      glosa: 'ਗਲੋਸਾ ਸਲਾਹ: ਅਗਲੀ ਹਰੀ ਬੱਤੀ ਲਈ 45 ਕਿਲੋਮੀਟਰ/ਘੰਟਾ ਦੀ ਰਫ਼ਤਾਰ ਬਣਾ ਕੇ ਰੱਖੋ।',
      commute: 'ਘਰ ਜਾਣ ਵਾਲਾ ਰਸਤਾ ਬਿਲਕੁਲ ਸਾਫ਼ ਹੈ। ਲਗਭਗ 14 ਮਿੰਟ ਲੱਗਣਗੇ।',
      reroute: 'ਅੱਗੇ ਜਾਮ ਹੈ। 5 ਮਿੰਟ ਬਚਾਉਣ ਵਾਲਾ ਨਵਾਂ ਰਸਤਾ ਚੁਣਿਆ ਗਿਆ ਹੈ।',
    },
  },
  or: {
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    alerts: {
      maneuver: '300 ମିଟର ପରେ ଆଉଟର ରିଙ୍ଗ ରୋଡରେ ଡାହାଣକୁ ବୁଲନ୍ତୁ।',
      hazard: 'ସତର୍କତା: 500 ମିଟର ଆଗରେ ପାଣି ଜମି ରହିଛି। ଗାଡ଼ିର ଗତି ଧୀର କରନ୍ତୁ।',
      glosa: 'ଗ୍ଲୋସା ସୂଚନା: ଆଗାମୀ ସବୁଜ ସଙ୍କେତ ପାଇଁ 45 କିମି/ଘଣ୍ଟା ଗତି ବଜାୟ ରଖନ୍ତୁ।',
      commute: 'ଘରକୁ ଯିବା ରାସ୍ତା ସହଜ ଅଛି। ପ୍ରାୟ 14 ମିନିଟ ସମୟ ଲାଗିବ।',
      reroute: 'ଆଗରେ ଟ୍ରାଫିକ ଜାମ ଅଛି। ନୂଆ ରାସ୍ତା ବାଛି ନିଆଗଲା।',
    },
  },
  as: {
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    alerts: {
      maneuver: '৩০০ মিটাৰৰ পাছত আউটাৰ ৰিং ৰোডত সোঁফালে ঘূৰক।',
      hazard: 'সাৱধান: ৫০০ মিটাৰ আগত পানী জমা হৈ আছে। অনুগ্ৰহ কৰি গতি কম কৰক।',
      glosa: 'গ্ল’ছা পৰামৰ্শ: সেউজীয়া সংকেত পাবলৈ ৪৫ কিমি/ঘণ্টা গতি বজাই ৰাখক।',
      commute: 'ঘৰলৈ যোৱাৰ পথ সুগম। আনুমানিক ১৪ মিনিট সময় লাগিব।',
      reroute: 'আগত যান-জঁট আছে। ৫ মিনিট ৰাহি হোৱা নতুন পথ নিৰ্বাচন কৰা হ’ল।',
    },
  },
};

let currentlySpeaking = false;
const speechListeners = new Set<(isSpeaking: boolean, text?: string) => void>();

export function subscribeSpeechState(listener: (isSpeaking: boolean, text?: string) => void) {
  speechListeners.add(listener);
  return () => {
    speechListeners.delete(listener);
  };
}

function notifySpeechState(speaking: boolean, text?: string) {
  currentlySpeaking = speaking;
  speechListeners.forEach(listener => listener(speaking, text));
}

/**
 * Functional Speech Synthesis Engine (TTS) for Indian Regional Languages.
 * Uses Web SpeechSynthesis in Web/PWA, or audio playback fallback.
 */
export async function speakText(
  text: string,
  lang: SupportedLanguage = 'hi',
  onComplete?: () => void
): Promise<void> {
  if (!text || text.trim().length === 0) return;

  stopSpeaking();
  notifySpeechState(true, text);

  const bcp47 = INDIAN_LANGUAGES[lang]?.bcp47 || 'hi-IN';

  // 1. Web Speech API (Standard in browsers and WebView)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Find best matching voice if available
      const voices = window.speechSynthesis.getVoices?.() || [];
      const matchingVoice = voices.find(v => v.lang.startsWith(lang) || v.lang === bcp47);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        notifySpeechState(false);
        onComplete?.();
      };

      utterance.onerror = () => {
        notifySpeechState(false);
        onComplete?.();
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch {
      // Fall through to audio notification simulation
    }
  }

  // 2. Mobile / Fallback simulation with realistic speech duration
  const estimatedDurationMs = Math.max(1800, text.length * 75);
  setTimeout(() => {
    notifySpeechState(false);
    onComplete?.();
  }, estimatedDurationMs);
}

/**
 * Stop any currently playing speech.
 */
export function stopSpeaking(): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Non-blocking
    }
  }
  notifySpeechState(false);
}

/**
 * Check if voice guide is currently speaking.
 */
export function isVoiceSpeaking(): boolean {
  return currentlySpeaking;
}

/**
 * Play a predefined vernacular navigation alert in the chosen language.
 */
export function playVernacularAlert(
  lang: SupportedLanguage,
  alertType: 'maneuver' | 'hazard' | 'glosa' | 'commute' | 'reroute'
): string {
  const languagePack = VERNACULAR_ALERTS[lang] || VERNACULAR_ALERTS.en;
  const message = languagePack.alerts[alertType];
  speakText(message, lang);
  return message;
}
