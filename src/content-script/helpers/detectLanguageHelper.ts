import { francAll } from 'franc-min';
import { invert } from './commonHelper';

const languageList = {
  'en-US': 'eng',
  'id-ID': 'ind',
  'ms-MY': 'zlm',
  'ca-ES': 'cat',
  'cs-CZ': 'ces',
  'da-DK': 'dan',
  'de-DE': 'deu',
  'et-EE': 'est',
  'es-ES': 'spa',
  'fr-FR': 'fra',
  'hr-HR': 'hrv',
  'it-IT': 'ita',
  'hu-HU': 'hun',
  'nl-HU': 'nld',
  'no-NO': 'nno',
  'pl-PL': 'pol',
  'pt-BR': 'por',
  'ro-RO': 'ron',
  'sl-SI': 'slv',
  'sv-SE': 'swe',
  'vi-VN': 'vie',
  'tr-TR': 'tur',
  'yo-NG': 'yor',
  'el-GR': 'ell',
  'bg-BG': 'bul',
  'ru-RU': 'rus',
  'uk-UA': 'ukr',
  'he-IL': 'heb',
  'ar-SA': 'arb',
  'ne-NP': 'nep',
  'hi-IN': 'hin',
  'bn-IN': 'ben',
  'ta-IN': 'tam',
  'lo-LA': 'lao',
  'th-TH': 'tha',
  'ko-KR': 'kor',
  'ja-JP': 'jpn',
  'zh-CN': 'cmn',
};

const getFormattedLanguages = (languages:Array<import('trigram-utils').TrigramTuple>) => {
  const languageListInverted = invert(languageList);
  let addMore = true;
  if (!languages.length) return [];
  const result = languages.reduce((acc, el, i) => {
    const [lang] = el;
    if (lang === 'crt') return acc;
    // @ts-ignore
    const supportedLang = languageListInverted[lang];
    if (!supportedLang || !addMore) return acc;
    // @ts-ignore
    acc.push(supportedLang);
    if (lang === 'eng' && !i) addMore = false;
    return acc;
  }, []);
  if (!result.length) return result;
  // @ts-ignore
  if (!result.includes(languageListInverted.eng)) {
    return [result[0]];
  }
  return result;
};

const domainNativeLanguages = {
  com: ['en-US'],
  ca: ['en-US', 'fr-FR'],
  'com.mx': ['es-ES', 'en-US'],
  'com.br': ['pt-BR', 'en-US'],
  'co.uk': ['en-US'],
  fr: ['fr-FR', 'en-US'],
  it: ['it-IT', 'en-US'],
  es: ['es-ES', 'en-US'],
  de: ['de-DE', 'en-US'],
  nl: ['nl-HU', 'en-US'],
  se: ['sv-SE', 'en-US'],
  pl: ['pl-PL', 'en-US'],
  in: ['hi-IN', 'en-US'],
  ae: ['ar-SA', 'en-US'],
  sa: ['ar-SA', 'en-US'],
  sg: ['en-US'],
  'co.jp': ['ja-JP', 'en-US'],
  'com.au': ['en-US'],
};

const getDomain = (): string => {
  const domainRegex = /https?:\/\/www\.amazon\.(\w.+?)\//;
  const match = document.URL.match(domainRegex);
  if (!match) return 'com';
  if (match.length < 2) {
    return 'com';
  }
  return match[1];
};

const getDomainDefaultLanguage = () => {
  const domain = getDomain() as keyof typeof domainNativeLanguages;
  return domainNativeLanguages[domain][0];
};

const getLanguage = (language: string):string => {
  const domain = getDomain() as keyof typeof domainNativeLanguages;
  const domainLanguages = domainNativeLanguages[domain];
  if (domainLanguages.includes(language)) return language;
  return domainLanguages[0];
};

export const detectLanguage = (data: string): string => {
  const text = `${data.replace(/(?:!?\[(.*?)\]\((.*?)\))|(<\/?[^>]+(>|$))/g, '')}\n`;
  const existLanguages = francAll(text, { only: Object.values(languageList) });
  if (!existLanguages.length) return getDomainDefaultLanguage();
  const languages = getFormattedLanguages(existLanguages.slice(0, 2));
  if (languages.length) return getLanguage(languages[0]);
  return getDomainDefaultLanguage();
};
