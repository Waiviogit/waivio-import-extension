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

export const detectLanguage = (data: string): string => {
  const text = `${data.replace(/(?:!?\[(.*?)\]\((.*?)\))|(<\/?[^>]+(>|$))/g, '')}\n`;
  const existLanguages = francAll(text, { only: Object.values(languageList) });
  if (!existLanguages.length) return 'en-US';
  const languages = getFormattedLanguages(existLanguages.slice(0, 2));
  console.log(languages);
  if (languages.length) return languages[0];
  return 'en-US';
};
