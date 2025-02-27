import React from 'react';
import ReactDOM from 'react-dom/client';
import getVideoCaptions, { captionType, extractVideoId } from './youtubeHelper';
import { SOURCE_TYPES } from '../../common/constants';
import { getWaivioUserInfo } from './userHelper';
import { getPostImportHost } from './downloadWaivioHelper';
import CreatePostModal from '../components/createPostModal';
import { extractHashtags, makeValidTag, tikTokInfoHandler } from './postHelper';
import { getGptAnswer } from './gptHelper';
import { getTikTokUsername } from './tikTokHelper';
import { getInstagramDescription, getInstagramUsername } from './instaHelper';

interface createQueryInterface {
    subs: string
    source?:string
}

interface formatAnswerInterface {
  attribution: string
  link: string
  answer: string
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
  subs, source,
}: createQueryInterface): string => {
  const query = `act as professional journalist:
  rewrite in third person in 3 paragraphs (make it sound like a human), create title,
  add hashtags (composed of one word lowercase) at the very end,
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
  - Add hashtags (composed of one word in lowercase) at the very end.

  If the following text is in a language other than English, translate it into English: ${subs}. If you think it is not a cooking video, respond: "I can't find a recipe in this video, try another one."
  `;

  const querySet = {
    [SOURCE_TYPES.RECIPE_DRAFT]: recipeQuery,
    [SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM]: recipeQuery,
    [SOURCE_TYPES.RECIPE_DRAFT_TIKTOK]: recipeQuery,
    default: query,
  };
  if (source) return querySet[source] || querySet.default;

  return querySet.default;
};

const formatGptAnswer = ({
  answer, attribution, link,
}: formatAnswerInterface) :string => {
  const paragraphs = answer.split('\n\n');
  paragraphs.splice(2, 0, link);

  const formatted = convertHashtagsToLowerCase(paragraphs.join('\n'));

  return `${formatted}\n${attribution}`;
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
      account: '',
    };
  }
};

type BodyTitleType = {
  title: string
  body: string
  attribution: string
  link: string
  author: string
}

const EMPTY_BODY_RESPONSE = {
  title: '',
  body: '',
  attribution: '',
  link: '',
  author: '',
};

const getYoutubeDraft = async (): Promise<BodyTitleType> => {
  const link = document.URL;
  const videoId = extractVideoId(link);

  const {
    captions, body, title, author, linkToChannel, account,
  } = await getSubsById(videoId);

  if (!body && !captions) return EMPTY_BODY_RESPONSE;

  const linkToAuthorAndChannel = `YouTube channel - ${author}: ${linkToChannel}`;

  return {
    title,
    body: cutSubs(`${body} ${captions}`),
    attribution: linkToAuthorAndChannel,
    link,
    author: account,
  };
};

export const extractInstagramVideoId = (url: string): string => {
  const match = url.match(/instagram\.com\/(?:[\w-]+\/)?(p|reel)\/([\w-]+)/);
  return match ? match[2] : '';
};

const getInstagramDraft = async (): Promise<BodyTitleType> => {
  const id = extractInstagramVideoId(document.URL);

  if (!id) {
    return EMPTY_BODY_RESPONSE;
  }

  const link = `https://www.instagram.com/p/${id}`;
  const author = getInstagramUsername();
  const attribution = `Instagram profile - ${author}: https://www.instagram.com/${author}/`;
  const body = getInstagramDescription();

  return {
    body, link, attribution, title: '', author,
  };
};

const getGptMarkdownFormat = async (body: string, source: string):Promise<string> => {
  if (![SOURCE_TYPES.RECIPE_DRAFT, SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM, SOURCE_TYPES.RECIPE_DRAFT_TIKTOK].includes(source)) return body;

  const query = `I have a series of recipe posts that need formatting in Markdown. Please format each recipe following these detailed guidelines:

1. **Introduction:**
   - Begin with a brief introduction about the recipe, capturing its essence and unique attributes.

2. **YouTube Link:**
   - Include the YouTube link provided for each recipe immediately after the introduction.

3. **Ingredients Section:**
   - Use a heading for the Ingredients section.
   - List each ingredient starting with an emoji, followed by the quantity and description, without bullet points.
   - Ensure there is a separator line (\`---\`) after the Ingredients section.

4. **Instructions Section:**
   - Use a heading for the Instructions section.
   - Number each main step using  "1- " "2- " "3- " "4- " and so on.
   - Add two empty lines after each step
   - Format each main step with a bolded sub-step title.
   - Use bullet points for each sub-step to enhance clarity and readability.

5. **Time, Servings, and Equipment Section:**
   - Combine the Prep Time, Cook Time, Total Time, Servings, and Equipment into one section.
   - Ensure no separator lines break this combined section.

6. **Cooking Tips:**
   - Use a heading for Cooking Tips.
   - Provide bullet points for each tip to enhance clarity.

7. **Hashtags and YouTube Channel:**
   - Include a section for hashtags relevant to the recipe, formatted with a separator line before and after.
   - Include a link to the YouTube channel, formatted similarly with separator lines.

Provide the output in markdown code that I can copy and paste.
This is the Example Format in markdown:
[Introduction about the recipe]
[YouTube link]

#### Ingredients
[Emoji] [Quantity] [Ingredient Description]  
[Continue listing ingredients]

---

#### Instructions
1) **[Step Title]:**  
   - [Sub-step description]
   - [Sub-step description]

2) **[Step Title]:**  
   - [Sub-step description]
   - [Sub-step description]

---

**Prep Time:** [Time]  
**Cook Time:** [Time]  
**Total Time:** [Time]  
**Servings:** [Number of servings]  
**Equipment:** [List of equipment]  

---

**Cooking Tips:**  
- [Tip 1]
- [Tip 2]

---

#[Hashtags]

---

YouTube channel - [Channel Name]: [YouTube URL]


---

I will give you the recipes next and you give me the edited text in markdown so I can copy and paste it-
Remember to put a separator after the instructions section and another separator before cooking tips.
don't use wrapping in \`\`\`markdown
${body}

  `;
  const { result: postDraft, error } = await getGptAnswer(query);
  if (error) return body;

  return postDraft as string;
};

const getTiktokDraft = async (): Promise<BodyTitleType> => {
  const link = document.URL;

  if (link === 'https://www.tiktok.com/foryou') {
    alert('go to explore page or particular author page to get post');
    return EMPTY_BODY_RESPONSE;
  }

  const result = await tikTokInfoHandler();
  if (!result) {
    return EMPTY_BODY_RESPONSE;
  }
  const { title } = result;

  const author = getTikTokUsername(link);
  const attribution = `Tiktok profile - ${author}: https://www.tiktok.com/@${author}`;
  return {
    body: title, link, attribution, title: '', author,
  };
};

const draftBySiteHandler = {
  [SOURCE_TYPES.RECIPE_DRAFT_TIKTOK]: getTiktokDraft,
  [SOURCE_TYPES.DRAFT_TIKTOK]: getTiktokDraft,
  [SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM]: getInstagramDraft,
  [SOURCE_TYPES.DRAFT_INSTAGRAM]: getInstagramDraft,
  [SOURCE_TYPES.RECIPE_DRAFT]: getYoutubeDraft,
  default: getYoutubeDraft,
};

export const createDraft = async (source?:string): Promise<void> => {
  const getBody = source ? draftBySiteHandler[source] : draftBySiteHandler.default;

  const {
    title, body, attribution, link, author,
  } = await getBody();

  if (!body) {
    alert('Parsing post body error');
    return;
  }

  const query = createQuery({
    subs: body, source,
  });

  const { result: postDraft, error } = await getGptAnswer(query);
  if (!postDraft) {
    // @ts-ignore
    alert(`Gpt error ${error?.message ?? ''}`);
    return;
  }

  const draftBody = formatGptAnswer({
    answer: postDraft, link, attribution,
  });

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  const tagsFromBody = extractHashtags(draftBody);
  const authorTag = makeValidTag(author);
  const tags = ['waivio', authorTag];
  if (tagsFromBody.length) tags.push(...tagsFromBody);

  const userInfo = await getWaivioUserInfo();
  if (!userInfo) return;
  const {
    userName,
  } = userInfo;

  const resultBody = await getGptMarkdownFormat(draftBody, source || '');

  const host = await getPostImportHost(userName) || 'www.waivio.com';

  rootModal.render(
      // @ts-ignore
      <CreatePostModal
          author={userName}
          title={title}
          body={`${resultBody}\n#${authorTag}\n\n`}
          tags={tags}
          host={host}
          source={source}
      >
      </CreatePostModal>,
  );
};
