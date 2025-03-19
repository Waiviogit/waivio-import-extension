import React from 'react';
import ReactDOM from 'react-dom/client';
import CreatePostModal from '../components/createPostModal';
import { SOURCE_TYPES } from '../../common/constants';
import {
  extractVideoId, fetchVideoContent, getChanelURL, getTitleAndBody,
} from './youtubeHelper';
import { getWaivioUserInfo } from './userHelper';
import { fetchTiktok, getTikTokDesc, getTikTokUsername } from './tikTokHelper';
import { getPostImportHost } from './downloadWaivioHelper';
import { Draft, extractInstagramVideoId } from './draftHelper';
import { getInstagramDescription, getInstagramUsername } from './instaHelper';

type parsedPostType = {
  title: string
  body: string
  author: string
}

export const makeValidTag = (tag: string): string => tag
  .toLocaleLowerCase()
  .replace(/_/g, '-')
  .replace(/[^a-z0-9-]+/g, '');

export const extractHashtags = (text: string) : string[] => {
  const regex = /#(\w+)/g;
  const hashtags = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  return hashtags;
};

const youtubeInfoHandler = async (): Promise<parsedPostType|null> => {
  try {
    const id = extractVideoId(document.URL);
    const content = await fetchVideoContent(id);

    const { title, body } = getTitleAndBody(content);
    const { account } = getChanelURL(content);

    return {
      title, body: `${document.URL}\n${body}`, author: account,
    };
  } catch (error) {
    // @ts-ignore
    alert(error?.message);
    return null;
  }
};

export const tikTokInfoHandler = async (): Promise<parsedPostType|null> => {
  try {
    const url = document.URL;
    const content = await fetchTiktok(url);
    const decr = getTikTokDesc(content);

    const author = getTikTokUsername(url);

    return {
      title: decr, body: `${url}\n${decr}`, author,
    };
  } catch (error) {
    // @ts-ignore
    alert(error?.message);
    return null;
  }
};

export const instInfoHandler = async (): Promise<parsedPostType> => {
  const id = extractInstagramVideoId(document.URL);

  const link = `https://www.instagram.com/p/${id}`;

  const body = getInstagramDescription();
  const author = getInstagramUsername();

  return {
    title: '',
    body: `${link}\n${body}`,
    author,
  };
};

const postInfoHandler = {
  [SOURCE_TYPES.YOUTUBE]: youtubeInfoHandler,
  [SOURCE_TYPES.DRAFT_YOUTUBE]: youtubeInfoHandler,
  [SOURCE_TYPES.RECIPE_DRAFT]: youtubeInfoHandler,
  [SOURCE_TYPES.TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.DRAFT_TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.RECIPE_DRAFT_TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.INSTAGRAM]: instInfoHandler,
  [SOURCE_TYPES.DRAFT_INSTAGRAM]: instInfoHandler,
  [SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM]: instInfoHandler,
};

export const extractPostInfo = async (source: string): Promise<Draft|null> => {
  const handler = postInfoHandler[source as keyof typeof postInfoHandler];

  const response = await handler();
  if (!response) return null;
  const { body, title, author } = response;

  const tagsFromBody = extractHashtags(body);
  const authorTag = makeValidTag(author);
  const tags = ['waivio', authorTag];
  if (tagsFromBody.length) tags.push(...tagsFromBody);

  return {
    body: `${body}\n#${authorTag}\n\n`,
    tags,
    title,
  };
};

export const createPost = async (source?:string): Promise<void> => {
  if (!source) return;

  const draft = await extractPostInfo(source);
  if (!draft) return;

  const { body, title, tags } = draft;

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  const userInfo = await getWaivioUserInfo();
  if (!userInfo) return;
  const {
    userName,
  } = userInfo;

  const host = await getPostImportHost(userName) || 'www.waivio.com';

  rootModal.render(
        // @ts-ignore
        <CreatePostModal
            author={userName}
            title={title}
            body={body}
            tags={tags}
            host={host}
        >
        </CreatePostModal>,
  );
};
