import { EXTERNAL_URL } from '../constants';

type authorLinkType = {
    author: string
    linkToChannel: string
}

type captionTrackType = {
    baseUrl: string
    isTranslatable: boolean
    kind: string
    languageCode: string
    vssId: string
    name: { simpleText: string }
}

type responseType = {
    result?: string
    error?: unknown
}

interface createQueryInterface {
    subs: string
}

interface formatAnswerInterface {
  videoTitle: string
  author: string
  linkToChannel: string
  answer: string
  linkToVideo: string
}

const getTitle = () => document.querySelector<HTMLElement>('h1.style-scope.ytd-watch-metadata')?.innerText ?? '';

const getAuthorAndLink = (): authorLinkType => {
  const linkToChannel = document.querySelector<HTMLLinkElement>('#text-container a');

  return {
    author: (linkToChannel?.innerText ?? '').trim(),
    linkToChannel: linkToChannel?.href ?? '',
  };
};

const getCaptionTracks = (): captionTrackType[] => {
  const regex = /({"captionTracks":.*isTranslatable":(true|false)}])/;
  const scriptInnerTexts = Array.from(document.querySelectorAll('script')).map((el) => el.innerText);
  const script = scriptInnerTexts.find((el) => regex.test(el));
  const found = regex.exec(script || '');
  if (!found) return [];
  const [match] = found;
  const { captionTracks } = JSON.parse(`${match}}`);
  return captionTracks;
};

const getSubsByUrl = async (url: string): Promise<responseType> => {
  try {
    const response = await fetch(url);
    const transcript = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(transcript, 'text/xml');
    const textTags = xmlDoc.getElementsByTagName('text');
    const result = Array.from(textTags).map((textTag) => textTag.textContent).join('');
    return { result };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const getGptAnswer = async (query: string): Promise<responseType> => {
  try {
    const response = await fetch(
      EXTERNAL_URL.WAIVIO_IMPORT_GPT_QUERY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      },
    );
    const responseData = await response.json();

    return { result: responseData.result };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const getSubsUrl = (captions: captionTrackType[]): string => {
  const caption = captions.find((el) => el.languageCode === 'en' || el.languageCode === 'en-US');
  if (!caption) return captions[0].baseUrl;
  return caption.baseUrl;
};

const cutSubs = (subs: string): string => {
  const maxLength = 5000;
  if (subs.length > maxLength) return subs.slice(0, maxLength);
  return subs;
};

const createQuery = ({
  subs,
}: createQueryInterface): string => {
  const query = `rewrite in third person in 3 paragraphs (make it sound like a human), 
  add hashtags (composed of one word) at the very end, including #chatgpt,
  if following text would be in other language than english - rewrite it into english, here is the text: ${subs}
  answer schema: 
  First paragraph
  Second paragraph
  Third paragraph
  Hashtags
  `;

  return query;
};

const copyContent = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const confirmCopy = async (string: string) => {
  if (window.confirm(string)) {
    await copyContent(string);
  }
};

const formatGptAnswer = ({
  answer, author, linkToChannel, videoTitle, linkToVideo,
}: formatAnswerInterface) :string => {
  const paragraphs = answer.split('\n\n');
  paragraphs.splice(1, 0, linkToVideo);

  const formatted = paragraphs.join('\n\n');

  return `${videoTitle}\n\n${formatted}\n\n[${author}](${linkToChannel})`;
};

export const createDraft = async (): Promise<void> => {
  const videoTitle = getTitle();
  const { author, linkToChannel } = getAuthorAndLink();
  const linkToVideo = document.URL;
  const captions = getCaptionTracks();

  if (!captions.length) {
    alert('No captions were found, try to reload page and try again');
    return;
  }
  const url = getSubsUrl(captions);
  const { result } = await getSubsByUrl(url);
  if (!result) {
    alert('Fetch subs error, try to reload page and try again');
    return;
  }
  const subs = cutSubs(result);

  const query = createQuery({ subs });
  const { result: postDraft, error } = await getGptAnswer(query);
  if (!postDraft) {
    // @ts-ignore
    alert(`Gpt error ${error?.message ?? ''}`);
    return;
  }
  const formatted = formatGptAnswer({
    author, linkToChannel, linkToVideo, videoTitle, answer: postDraft,
  });

  await confirmCopy(formatted);
};
