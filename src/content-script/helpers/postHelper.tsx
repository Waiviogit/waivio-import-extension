import { SOURCE_TYPES } from '../../common/constants';
import {
  extractVideoId, fetchVideoContent,  getTitleAndBody,
} from './youtubeHelper';
import { fetchTiktok, getTikTokDesc, getTikTokUsername } from './tikTokHelper';
import { Draft, extractInstagramVideoId, createUnifiedModal } from './draftHelper';
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

export const formatHashTags = (body: string, author: string) => {
  const tagsFromBody = extractHashtags(body);
  const authorTag = makeValidTag(author);
  const tags = ['waivio'];

  if (authorTag) tags.push(authorTag);
  if (tagsFromBody.length) tags.push(...tagsFromBody);

  return tags;
};

const youtubeInfoHandler = async (): Promise<parsedPostType|null> => {
  try {
    const id = extractVideoId(document.URL);
    const content = await fetchVideoContent(id);

    const { title, body, account } = getTitleAndBody(content);

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
  [SOURCE_TYPES.TUTORIAL_YOUTUBE]: youtubeInfoHandler,
  [SOURCE_TYPES.TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.DRAFT_TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.RECIPE_DRAFT_TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.TUTORIAL_TIKTOK]: tikTokInfoHandler,
  [SOURCE_TYPES.INSTAGRAM]: instInfoHandler,
  [SOURCE_TYPES.DRAFT_INSTAGRAM]: instInfoHandler,
  [SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM]: instInfoHandler,
  [SOURCE_TYPES.TUTORIAL_INSTAGRAM]: instInfoHandler,
};

export const extractPostInfo = async (source: string): Promise<Draft|null> => {
  const handler = postInfoHandler[source as keyof typeof postInfoHandler];
  if (!handler) return null;

  const response = await handler();
  if (!response) return null;
  const { body, title, author } = response;

  const tags = formatHashTags(body, author);
  const authorTag = makeValidTag(author);

  return {
    body: `${body}\n#${authorTag}\n\n`,
    tags,
    title,
  };
};

export const createPost = async (source?: string): Promise<void> => {
  if (!source) return;
  await createUnifiedModal(source, 'CREATE_POST');
};
