import React from 'react';
import ReactDOM from 'react-dom/client';
import CreatePostModal from '../components/createPostModal';
import { SOURCE_TYPES } from '../../common/constants';
import { extractVideoId, fetchVideoContent, getTitleAndBody } from './youtubeHelper';
import { getWaivioUserInfo } from './userHelper';
import { fetchTiktok, getTikTokDesc } from './tikTokHelper';
import { getPostImportHost } from './downloadWaivioHelper';

type parsedPostType = {
  title: string
  body: string
}

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

    return {
      title, body: `${document.URL}\n${body}`,
    };
  } catch (error) {
    // @ts-ignore
    alert(error?.message);
    return null;
  }
};

const tikTokInfoHandler = async (): Promise<parsedPostType|null> => {
  try {
    const url = document.URL;
    const content = await fetchTiktok(url);
    const decr = getTikTokDesc(content);

    return {
      title: decr, body: `${url}\n${decr}`,
    };
  } catch (error) {
    // @ts-ignore
    alert(error?.message);
    return null;
  }
};

const postInfoHandler = {
  [SOURCE_TYPES.YOUTUBE]: youtubeInfoHandler,
  [SOURCE_TYPES.TIKTOK]: tikTokInfoHandler,
};

export const createPost = async (source?:string): Promise<void> => {
  if (!source) return;

  const handler = postInfoHandler[source as keyof typeof postInfoHandler];

  const response = await handler();
  if (!response) return;
  const { body, title } = response;

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  const tagsFromBody = extractHashtags(body);
  const tags = ['waivio'];
  if (tagsFromBody.length) tags.push(...tagsFromBody);

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
