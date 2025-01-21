import React from 'react';
import ReactDOM from 'react-dom/client';
import getVideoCaptions, { captionType, extractVideoId } from './youtubeHelper';
import { SOURCE_TYPES } from '../../common/constants';
import { getWaivioUserInfo } from './userHelper';
import { getPostImportHost } from './downloadWaivioHelper';
import CreatePostModal from '../components/createPostModal';
import { extractHashtags } from './postHelper';
import { getGptAnswer } from './gptHelper';

interface createQueryInterface {
    subs: string
    author: string
    linkToChannel: string
    source?:string
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

const cutSubs = (subs: string): string => {
  const maxLength = 5000;
  if (subs.length > maxLength) return subs.slice(0, maxLength);
  return subs;
};

const createQuery = ({
  subs, author, linkToChannel, source,
}: createQueryInterface): string => {
  const query = `act as professional journalist:
  rewrite in third person in 3 paragraphs (make it sound like a human), create title,
  make attribution to author ${author} channel ${linkToChannel},
  add hashtags (composed of one word lowercase) at the very end, including #chatgpt,
  if following text would be in other language than english - rewrite it into english, here is the text: ${subs}
  `;

  const recipeQuery = `act as professional chef:
  create a recipe from YouTube subtitles. Focus on the recipe itself and follow these steps:
  - Create a title for the recipe.
  - Write a short introduction.
  - Provide a list of ingredients, each ingredient start with new line and corresponding emoji e.g. 🥚 2 eggs\n🫒 1 teaspoon olive oil.
  - Write detailed instructions on how to cook the recipe.
  - If it's relevant to the context of the recipe, add  Prep Time: How long it takes to prepare the ingredients; Cook Time: How long it takes to cook or bake.
    Total Time: Combined prep and cook times; Equipment; Cooking Tips; Servings;
  - Attribute the recipe to the author ${author} and their YouTube channel ${linkToChannel}.
  - Add hashtags (composed of one word in lowercase) at the very end, including #chatgpt.

  If the following text is in a language other than English, translate it into English: ${subs}. If you think it is not a cooking video, respond: "I can't find a recipe in this video, try another one."
  `;

  const querySet = {
    [SOURCE_TYPES.RECIPE_DRAFT]: recipeQuery,
    default: query,
  };
  if (source) return querySet[source] || querySet.default;

  return querySet.default;
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

const getSubsById = async (videoId :string): Promise<captionType> => {
  try {
    const captions = await getVideoCaptions(videoId, { plainText: true });
    return captions;
  } catch (error) {
    return {
      captions: '',
      author: '',
      linkToChannel: '',
      body: '',
      title: '',
    };
  }
};

export const createDraft = async (source?:string): Promise<void> => {
  const linkToVideo = document.URL;
  const videoId = extractVideoId(linkToVideo);

  const {
    captions, author, linkToChannel, body, title,
  } = await getSubsById(videoId);
  if (!captions) {
    alert('Fetch subs error, try to reload page and try again');
    return;
  }

  const subs = cutSubs(`${body} ${captions}`);

  const query = createQuery({
    subs, author, linkToChannel, source,
  });
  const { result: postDraft, error } = await getGptAnswer(query);
  if (!postDraft) {
    // @ts-ignore
    alert(`Gpt error ${error?.message ?? ''}`);
    return;
  }

  const draftBody = formatGptAnswer({
    answer: postDraft, linkToVideo, author, linkToChannel,
  });

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  const tagsFromBody = extractHashtags(draftBody);
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
          body={draftBody}
          tags={tags}
          host={host}
          source={source}
      >
      </CreatePostModal>,
  );
};
