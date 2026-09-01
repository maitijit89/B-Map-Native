export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'ta' | 'te';

export interface VernacularAlert {
  maneuver: string;
  hazard: string;
  glosa: string;
}

export const VERNACULAR_ALERTS: Record<SupportedLanguage, { name: string; nativeName: string; alerts: VernacularAlert }> = {
  en: {
    name: 'English',
    nativeName: 'English (Indian)',
    alerts: {
      maneuver: 'In 300 meters, turn right on Outer Ring Road.',
      hazard: 'Caution: Road waterlogging reported 500 meters ahead. Please reduce speed.',
      glosa: 'GLOSA advisory: Maintain 45 km/h to catch upcoming green wave.',
    },
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    alerts: {
      maneuver: '300 मीटर में, आउटर रिंग रोड पर दायें मुड़ें।',
      hazard: 'सावधान: 500 मीटर आगे जलभराव की सूचना है। कृपया गति धीमी करें।',
      glosa: 'ग्लोसा सूचना: हरी बत्ती पार करने के लिए 45 किमी/घंटा की गति बनाए रखें।',
    },
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    alerts: {
      maneuver: '300 ಮೀಟರ್‌ಗಳಲ್ಲಿ, ಔಟರ್ ರಿಂಗ್ ರಸ್ತೆಯಲ್ಲಿ ಬಲಕ್ಕೆ ತಿರುಗಿ.',
      hazard: 'ಎಚ್ಚರಿಕೆ: 500 ಮೀಟರ್ ಮುಂದೆ ರಸ್ತೆಯಲ್ಲಿ ನೀರು ನಿಂತಿದೆ. ದಯವಿಟ್ಟು ವೇಗ ಕಡಿಮೆ ಮಾಡಿ.',
      glosa: 'ಗ್ಲೋಸಾ ಮಾಹಿತಿ: ಮುಂದಿನ ಹಸಿರು ದೀಪ ಪಡೆಯಲು 45 ಕಿಮೀ/ಗಂ ವೇಗ ಕಾಯ್ದುಕೊಳ್ಳಿ.',
    },
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    alerts: {
      maneuver: '300 மீட்டரில், வெளிவட்டச் சாலையில் வலதுபுறம் திரும்பவும்.',
      hazard: 'எச்சரிக்கை: 500 மீட்டரில் தண்ணீர் தேக்கம் உள்ளது. வேகத்தைக் குறைக்கவும்.',
      glosa: 'க்ளோசா தகவல்: அடுத்த பச்சை விளக்கை அடைய 45 கிமீ/மணி வேகத்தைத் தொடரவும்.',
    },
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    alerts: {
      maneuver: '300 మీటర్లలో, ఔటర్ రింగ్ రోడ్డుపై కుడివైపు తిరగండి.',
      hazard: 'హెచ్చరిక: 500 మీటర్ల ముందు రోడ్డుపై నీరు నిలిచింది. దయచేసి వేగం తగ్గించండి.',
      glosa: 'గ్లోసా సలహా: తదుపరి గ్రీన్ సిగ్నల్ కోసం 45 కి.మీ/గం వేగాన్ని కొనసాగించండి.',
    },
  },
};

export function playVernacularAlert(lang: SupportedLanguage, alertType: 'maneuver' | 'hazard' | 'glosa'): string {
  const languagePack = VERNACULAR_ALERTS[lang] || VERNACULAR_ALERTS.en;
  const message = languagePack.alerts[alertType];
  return message;
}
