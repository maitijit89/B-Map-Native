import { storageService } from './StorageService';
import type { VoiceLanguageCode } from './StorageService';

export interface VoiceLanguageConfig {
  code: VoiceLanguageCode;
  name: string;
  script: string;
  nativeName: string;
  locale: string;
  ttsBadge: string;
}

export type NavigationPromptKey =
  | 'startRoute'
  | 'turnRight'
  | 'recalculating'
  | 'destinationReached'
  | 'unmuted'
  | 'languageChanged';

export const SUPPORTED_VOICE_LANGUAGES: readonly VoiceLanguageConfig[] = [
  { code: 'en', name: 'English', script: 'English', nativeName: 'English (Default)', locale: 'en-IN', ttsBadge: 'English TTS' },
  { code: 'bn', name: 'Bengali', script: 'বাংলা', nativeName: 'বাংলা', locale: 'bn-IN', ttsBadge: 'বাংলা TTS' },
  { code: 'hi', name: 'Hindi', script: 'हिन्दी', nativeName: 'हिन्दी', locale: 'hi-IN', ttsBadge: 'हिन्दी TTS' },
  { code: 'ta', name: 'Tamil', script: 'தமிழ்', nativeName: 'தமிழ்', locale: 'ta-IN', ttsBadge: 'தமிழ் TTS' },
  { code: 'te', name: 'Telugu', script: 'తెలుగు', nativeName: 'తెలుగు', locale: 'te-IN', ttsBadge: 'తెలుగు TTS' },
  { code: 'mr', name: 'Marathi', script: 'मराठी', nativeName: 'मराठी', locale: 'mr-IN', ttsBadge: 'मराठी TTS' },
  { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી', nativeName: 'ગુજરાતી', locale: 'gu-IN', ttsBadge: 'ગુજરાતી TTS' },
  { code: 'kn', name: 'Kannada', script: 'ಕನ್ನಡ', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN', ttsBadge: 'ಕನ್ನಡ TTS' },
  { code: 'ml', name: 'Malayalam', script: 'മലയാളം', nativeName: 'മലയാളം', locale: 'ml-IN', ttsBadge: 'മലയാളം TTS' },
  { code: 'pa', name: 'Punjabi', script: 'ਪੰਜਾਬੀ', nativeName: 'ਪੰਜਾਬੀ', locale: 'pa-IN', ttsBadge: 'ਪੰਜਾਬੀ TTS' },
  { code: 'or', name: 'Odia', script: 'ଓଡ଼ିଆ', nativeName: 'ଓଡ଼ିଆ', locale: 'or-IN', ttsBadge: 'ଓଡ଼ିଆ TTS' },
  { code: 'as', name: 'Assamese', script: 'অসমীয়া', nativeName: 'অসমীয়া', locale: 'as-IN', ttsBadge: 'অসমীয়া TTS' },
] as const;

const NAVIGATION_PROMPTS: Record<NavigationPromptKey, Record<VoiceLanguageCode, string>> = {
  startRoute: {
    en: 'Starting route to destination. In 350 meters, turn right onto Outer Ring Road Expressway.',
    bn: 'গন্তব্যের পথ শুরু হচ্ছে। ৩৫০ মিটার পর ডানদিকে ঘুরুন এবং আউটার রিং রোড এক্সপ্রেসওয়েতে থাকুন।',
    hi: 'गंतव्य का मार्ग शुरू हो रहा है। 350 मीटर बाद दाएँ मुड़ें और आउटर रिंग रोड एक्सप्रेसवे पर रहें।',
    ta: 'இலக்குக்கான பாதை தொடங்குகிறது. 350 மீட்டரில், வலதுபுறம் திரும்பி அவுட்டர் ரிங் ரோடு விரைவுச்சாலையில் தொடரவும்.',
    te: 'గమ్యస్థానానికి మార్గం ప్రారంభమవుతోంది. 350 మీటర్ల తర్వాత, కుడివైపుకి తిరిగి ఔటర్ రింగ్ రోడ్ ఎక్స్‌ప్రెస్‌వేలో ఉండండి.',
    mr: 'गंतव्यस्थानाचा मार्ग सुरू होत आहे. ३५० मीटरनंतर उजवीकडे वळा आणि आऊटर रिंग रोड एक्सप्रेसवेवर रहा.',
    gu: 'ગંતવ્યનો માર્ગ શરૂ થઈ રહ્યો છે. 350 મીટર પછી, જમણે વળો અને આઉટર રિંગ રોડ એક્સપ્રેસવે પર રહો.',
    kn: 'ಗಮ್ಯಸ್ಥಾನದ ಮಾರ್ಗ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ. 350 ಮೀಟರ್ ನಂತರ, ಬಲಕ್ಕೆ ತಿರುಗಿ ಔಟರ್ ರಿಂಗ್ ರೋಡ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇಯಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ.',
    ml: 'ലക്ഷ്യസ്ഥാനത്തേക്കുള്ള വഴി ആരംഭിക്കുന്നു. 350 മീറ്ററിനു ശേഷം വലത്തേക്ക് തിരിയുക.',
    pa: 'ਰਸਤਾ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ। 350 ਮੀਟਰ ਬਾਅਦ ਸੱਜੇ ਮੁੜੋ।',
    or: 'ଗନ୍ତବ୍ୟସ୍ଥଳକୁ ଯାତ୍ରା ଆରମ୍ଭ ହେଉଛି। 350 ମିଟର ପରେ ଡାହାଣକୁ ବୁଲନ୍ତୁ।',
    as: 'গন্তব্যলৈ যাত্ৰা আৰম্ভ হৈছে। ৩৫০ মিটাৰ পিছত সোঁফালে ঘূৰক।',
  },
  turnRight: {
    en: 'In 350 meters, turn right onto NH-48 Expressway and stay in right lane.',
    bn: '৩৫০ মিটার পর ডানদিকে ঘুরুন এবং NH-48 এক্সপ্রেসওয়েতে থাকুন।',
    hi: '350 मीटर बाद दाएँ मुड़ें और NH-48 एक्सप्रेसवे पर रहें।',
    ta: '350 மீட்டரில், வலதுபுறம் திரும்பி NH-48 விரைவுச்சாலையில் தொடரவும்.',
    te: '350 మీటర్ల తర్వాత, కుడివైపుకి తిరిగి NH-48 ఎక్స్‌ప్రెస్‌వేలో ఉండండి.',
    mr: '३५० मीटरनंतर उजवीकडे वळा आणि NH-48 एक्सप्रेसवेवर रहा.',
    gu: '350 મીટર પછી, જમણે વળો અને NH-48 એક્સપ્રેસવે પર રહો.',
    kn: '350 ಮೀಟರ್ ನಂತರ, ಬಲಕ್ಕೆ ತಿರುಗಿ NH-48 ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇಯಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ.',
    ml: '350 മീറ്ററിനു ശേഷം വലത്തേക്ക് തിരിഞ്ഞ് എൻ.എച്ച്-48 ൽ തുടരുക.',
    pa: '350 ਮੀਟਰ ਬਾਅਦ ਸੱਜੇ ਮੁੜੋ ਅਤੇ NH-48 ਤੇ ਰਹੋ।',
    or: '350 ମିଟର ପରେ ଡାହାଣକୁ ବୁଲି NH-48 ରେ ରୁହନ୍ତୁ।',
    as: '৩৫০ মিটাৰ পিছত সোঁফালে ঘূৰি NH-48 ত থাকক।',
  },
  recalculating: {
    en: 'Recalculating optimal route.',
    bn: 'নতুন এবং সর্বোত্তম রুট গণনা করা হচ্ছে।',
    hi: 'सर्वोत्तम मार्ग की पुनः गणना की जा रही है।',
    ta: 'சிறந்த பாதை மீண்டும் கணக்கிடப்படுகிறது.',
    te: 'సరైన మార్గం మళ్లీ లెక్కించబడుతోంది.',
    mr: 'सर्वोत्तम मार्गाची पुन्हा गणना केली जात आहे.',
    gu: 'શ્રેષ્ઠ માર્ગની ફરીથી ગણતરી કરવામાં આવી રહી છે.',
    kn: 'ಉತ್ತಮ ಮಾರ್ಗವನ್ನು ಮರು ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ.',
    ml: 'പുതിയ വഴി കണക്കാക്കുന്നു.',
    pa: 'ਨਵਾਂ ਰਸਤਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
    or: 'ନୂତନ ରାସ୍ତା ଖୋଜାଯାଉଛି।',
    as: 'নতুন পথ বিচৰা হৈছে।',
  },
  destinationReached: {
    en: 'You have reached your destination. Navigation completed.',
    bn: 'আপনি আপনার গন্তব্যে পৌঁছে গেছেন। নেভিগেশন সমাপ্ত।',
    hi: 'आप अपने गंतव्य पर पहुँच गए हैं। नेविगेशन समाप्त।',
    ta: 'நீங்கள் உங்கள் இலக்கை அடைந்துவிட்டீர்கள். வழிகாட்டல் முடிந்தது.',
    te: 'మీరు మీ గమ్యస్థానానికి చేరుకున్నారు. నావిగేషన్ పూర్తయింది.',
    mr: 'तुम्ही तुमच्या गंतव्यस्थानी पोहोचला आहात. नेव्हिगेशन समाप्त.',
    gu: 'તમે તમારા ગંતવ્ય પર પહોંચી ગયા છો. નેવિગેશન સમાપ્ત થયું.',
    kn: 'ನೀವು ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನವನ್ನು ತಲುಪಿದ್ದೀರಿ. ನ್ಯಾವಿಗೇಷನ್ ಮುಕ್ತಾಯವಾಯಿತು.',
    ml: 'നിങ്ങൾ ലക്ഷ്യസ്ഥാനത്ത് എത്തിച്ചേർന്നു.',
    pa: 'ਤੁਸੀਂ ਆਪਣੀ ਮੰਜ਼ਿਲ ਤੇ ਪਹੁੰਚ ਗਏ ਹੋ।',
    or: 'ଆପଣ ନିଜ ଗନ୍ତବ୍ୟସ୍ଥଳରେ ପହଞ୍ଚି ଯାଇଛନ୍ତି।',
    as: 'আপুনি আপোনাৰ গন্তব্যস্থানত উপনীত হৈছে।',
  },
  unmuted: {
    en: 'Voice guidance unmuted.',
    bn: 'ভয়েস নির্দেশিকা চালু করা হয়েছে।',
    hi: 'आवाज़ मार्गदर्शन चालू किया गया।',
    ta: 'குரல் வழிகாட்டல் இயக்கப்பட்டது.',
    te: 'వాయిస్ గైడెన్స్ ప్రారంభించబడింది.',
    mr: 'व्हॉइस मार्गदर्शन चालू केले.',
    gu: 'વોઇસ માર્ગદર્શન ચાલુ કરવામાં આવ્યું.',
    kn: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.',
    ml: 'വോയ്‌സ് മാർഗ്ഗനിർദ്ദേശം ഓണാക്കി.',
    pa: 'ਆਵਾਜ਼ ਮਾਰਗਦਰਸ਼ਨ ਚਾਲੂ ਹੈ।',
    or: 'ଭଏସ ଗାଇଡାନ୍ସ ଅନ କରାଗଲା।',
    as: 'ভইচ নিৰ্দেশনা অন কৰা হ’ল।',
  },
  languageChanged: {
    en: 'Voice language set to English.',
    bn: 'ভয়েস নির্দেশিকার ভাষা বাংলায় সেট করা হয়েছে।',
    hi: 'आवाज़ मार्गदर्शन की भाषा हिन्दी में सेट की गई है।',
    ta: 'குரல் வழிகாட்டல் மொழி தமிழில் அமைக்கப்பட்டுள்ளது.',
    te: 'వాయిస్ గైడెన్స్ భాష తెలుగులో సెట్ చేయబడింది.',
    mr: 'व्हॉइस मार्गदर्शनाची भाषा मराठीत सेट केली आहे.',
    gu: 'વોઇસ માર્ગદર્શનની ભાષા ગુજરાતીમાં સેટ કરવામાં આવી છે.',
    kn: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.',
    ml: 'ഭാഷ മലയാളമായി സജ്ജീകരിച്ചു.',
    pa: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਸੈੱਟ ਕੀਤੀ ਗਈ ਹੈ।',
    or: 'ଭାଷା ଓଡ଼ିଆରେ ସେଟ୍ ହୋଇଛି।',
    as: 'ভাষা অসমীয়াত ছেট কৰা হ’ল।',
  },
};

class VoiceLanguageService {
  private currentLanguage: VoiceLanguageCode = 'en';
  private isLoaded: boolean = false;
  private listeners = new Set<(lang: VoiceLanguageCode) => void>();

  constructor() {
    this.init();
  }

  public async init(): Promise<VoiceLanguageCode> {
    if (this.isLoaded) return this.currentLanguage;
    try {
      const prefs = await storageService.getPreferences();
      if (prefs?.voiceLanguage) {
        this.currentLanguage = prefs.voiceLanguage;
      }
    } catch {
      this.currentLanguage = 'en';
    } finally {
      this.isLoaded = true;
      this.notify();
    }
    return this.currentLanguage;
  }

  getLanguage(): VoiceLanguageCode {
    return this.currentLanguage;
  }

  getLanguageInfo(code: VoiceLanguageCode = this.currentLanguage): VoiceLanguageConfig {
    const found = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === code);
    return found || SUPPORTED_VOICE_LANGUAGES[0]; // fallback English
  }

  getPrompt(key: NavigationPromptKey, code: VoiceLanguageCode = this.currentLanguage): string {
    const promptsForCategory = NAVIGATION_PROMPTS[key];
    if (!promptsForCategory) return '';
    return promptsForCategory[code] || promptsForCategory['en'] || '';
  }

  async setLanguage(code: VoiceLanguageCode): Promise<void> {
    this.currentLanguage = code;
    try {
      await storageService.savePreferences({ voiceLanguage: code });
    } catch {
      // storage save fallback
    }
    this.notify();
  }

  subscribe(listener: (lang: VoiceLanguageCode) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentLanguage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentLanguage));
  }
}

export const voiceLanguageService = new VoiceLanguageService();
