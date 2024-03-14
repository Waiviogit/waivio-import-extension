import React from 'react';
import ReactDOM from 'react-dom/client';
import { EXTERNAL_URL } from '../constants';
import YoutubeDraftModal from '../components/youtubeDraftModal';

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
    author: string
    linkToChannel: string
}

interface formatAnswerInterface {
  author: string
  linkToChannel: string
  answer: string
  linkToVideo: string
}

const convertHashtagsToLowerCase = (inputString: string): string => {
  const regex = /#\w+/g;
  const convertedString = inputString.replace(regex, (match) => match.toLowerCase());
  return convertedString;
};

const getTitle = () => document.querySelector<HTMLElement>('h1.style-scope.ytd-watch-metadata')?.innerText ?? '';

const getAuthorAndLink = (): authorLinkType => {
  const linkToChannel = document.querySelector<HTMLLinkElement>('#text-container a');

  return {
    author: (linkToChannel?.innerText ?? '').trim(),
    linkToChannel: linkToChannel?.href ?? '',
  };
};

const extractVideoId = (url: string): string => {
  const regex = /watch\?v=([^&]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return '';
};

const getCaptionTracksAlternative = (): captionTrackType[] => {
  const videoId = extractVideoId(document.URL);
  const scriptInnerTexts = Array.from(document.querySelectorAll('script')).map((el) => el.innerText);
  const regex = new RegExp(`"baseUrl":"https://www.youtube.com/api/timedtext\\?v=${videoId}.*?"isTranslatable":true.*?}`);

  const script = scriptInnerTexts.find((el) => regex.test(el));

  const regex2 = /"captionTracks":(.*?)]/;

  const found = regex2.exec(script || '');
  if (!found) return [];

  const [, match] = found;

  try {
    const captionTracks = JSON.parse(`${match}]`);
    return captionTracks;
  } catch (error) {
    return [];
  }
};

const getCaptionTracks = (): captionTrackType[] => {
  const regex = /({"captionTracks":.*isTranslatable":(true|false)}])/;
  const scriptInnerTexts = Array.from(document.querySelectorAll('script')).map((el) => el.innerText);
  const script = scriptInnerTexts.find((el) => regex.test(el));
  const found = regex.exec(script || '');
  if (!found) return getCaptionTracksAlternative();
  const [match] = found;

  try {
    const { captionTracks } = JSON.parse(`${match}}`);
    return captionTracks;
  } catch (error) {
    return getCaptionTracksAlternative();
  }
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
    console.log('request sent');
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
  subs, author, linkToChannel,
}: createQueryInterface): string => {
  const query = `act as professional journalist:
  rewrite in third person in 3 paragraphs (make it sound like a human), create title,
  make attribution to author ${author} channel ${linkToChannel},
  add hashtags (composed of one word lowercase) at the very end, including #chatgpt,
  if following text would be in other language than english - rewrite it into english, here is the text: ${subs}
  `;
  return query;
};

const formatGptAnswer = ({
  answer, author, linkToChannel, linkToVideo,
}: formatAnswerInterface) :string => {
  const paragraphs = answer.split('\n\n');
  paragraphs.splice(2, 0, linkToVideo);

  const formatted = convertHashtagsToLowerCase(paragraphs.join('\n'));

  const linkToAuthorAndChannel = `YouTube channel - ${author}: ${linkToChannel}`;
  return `${formatted}\n${linkToAuthorAndChannel}`;
};

export const createDraft = async (): Promise<void> => {
  const videoTitle = getTitle();
  const { author, linkToChannel } = getAuthorAndLink();
  const linkToVideo = document.URL;
  const videoId = extractVideoId(linkToVideo);
  const captions = getCaptionTracks();

  if (!captions.length) {
    alert('No captions were found, try to reload page and try again');
    return;
  }
  const url = getSubsUrl(captions);
  if (!url.includes(videoId)) {
    if (window.confirm('We can\'t find subtitles for this video, please click ok to refresh the page')) {
      window.open(linkToVideo, '_self');
    }
    return;
  }

  const { result } = await getSubsByUrl(url);
  if (!result) {
    alert('Fetch subs error, try to reload page and try again');
    return;
  }

  const subs = cutSubs(result);

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  const query = createQuery({
    subs, author, linkToChannel,
  });
  const { result: postDraft, error } = await getGptAnswer(query);
  if (!postDraft) {
    // @ts-ignore
    alert(`Gpt error ${error?.message ?? ''}`);
    return;
  }

  const formatted = formatGptAnswer({
    answer: postDraft, linkToVideo, author, linkToChannel,
  });

  rootModal.render(
      // @ts-ignore
      <YoutubeDraftModal text={formatted}>
      </YoutubeDraftModal>,
  );
};
