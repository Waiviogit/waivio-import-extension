import React from 'react';
import ReactDOM from 'react-dom/client';
import getVideoCaptions, { captionType, extractVideoId } from './youtubeHelper';
import { RECIPE_SOURCE_TYPES, SOURCE_TYPES } from '../../common/constants';
import { getWaivioUserInfo } from './userHelper';
import { getPostImportHost } from './downloadWaivioHelper';
import CreatePostModal from '../components/createPostModal';
import {
  formatHashTags, makeValidTag, tikTokInfoHandler,
} from './postHelper';
import { getGptAnswer, videoAnalysesByLink } from './gptHelper';
import { getTikTokUsername } from './tikTokHelper';
import { getInstagramDescription, getInstagramUsername } from './instaHelper';
import { createAnalysisVideoPromptBySource, formatReviewPrompt, formatTutorialPrompt } from './promptHelper';
import { emitLoadingEvent } from '../emiters/loadingEmitter';

interface createQueryInterface {
    subs: string
    source?:string
}

interface formatAnswerInterface {
  attribution: string
  link: string
  answer: string
}

export interface Draft {
  body: string
  title: string
  tags: string[]
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
  const query = `Act as a professional journalist and product reviewer. 
Rewrite the following content for blog post in social media. 
Focus on clarity, product insight, and storytelling that captures real user experience. 

Generate an engaging and informative title suitable for a product review post. 
Generate body of post based on content do not just retell.
Important: Mention all products that shown in video.
At the very end, add 3–5 relevant hashtags (one word, all lowercase, no special characters) that relate to the product, its category, and the user experience. 
If the original text is not in English, translate it into fluent English. 
Here is the content to work with: ${subs}`;

  const recipeQuery = `act as a professional chef:
create a recipe from the content I'll give you. Focus on the recipe itself and follow these steps:
- Create a title for the recipe.
- Write a short introduction.
- Provide a list of ingredients; each ingredient should start on a new line and include a corresponding emoji (e.g. 🥚 2 eggs, 🫒 1 teaspoon olive oil).
  - For every ingredient, **identify and specify the brand or product name if it is visible, mentioned, or can be reasonably determined from the content.**
- Write detailed instructions on how to cook the recipe.
- If relevant to the context of the recipe, also include:
  Prep Time: How long it takes to prepare the ingredients;
  Cook Time: How long it takes to cook or bake;
  Total Time: Combined prep and cook times;
  Equipment: List all equipment, tools, or appliances used or shown in the recipe.
    - **Specify the brand or model of each piece of equipment if it is visible, mentioned, or can be reasonably determined.**
  Cooking Tips;
  Servings;
  Calories;
  Proteins, fats, and carbohydrates per serving.
- Add hashtags (composed of one word in lowercase) at the very end.

If the following text is in a language other than English, translate it into English. content: ${subs}
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
  if (!RECIPE_SOURCE_TYPES.includes(source)) return body;

  const query = `I have a recipe post that needs formatting in Markdown. Please format the recipe following these detailed guidelines:

1. **Introduction:**
   - Begin with a brief introduction about the recipe, describing its essence and unique attributes.

2. **YouTube Link:**
   - Include the YouTube link without formatting immediately after the introduction.

3. **Ingredients Section:**
   - Use a heading for the Ingredients section.
   - List each ingredient starting with an emoji, followed by the quantity and description, without bullet points.
   - **For every ingredient, include the brand or specific product name if it is shown, mentioned, or can be reasonably identified.**
   - Ensure there is a separator line (\`---\`) after the Ingredients section.
   - Do not use parentheses for any information (such as quantity, preparation, or optional).
   - Do not use phrases like "amount as needed" or "to taste"—try to provide a precise quantity.

4. **Instructions Section:**
   - Use a heading for the Instructions section.
   - Number each main step using  "1- " "2- " "3- " "4- " and so on.
   - Add two empty lines after each step
   - Format each main step with a bolded sub-step title.
   - Use bullet points for each sub-step to enhance clarity and readability.

5. **Time, Servings, and Equipment Section:**
   - Combine Prep Time, Cook Time, Total Time, Servings, Calories, Proteins, fats, and carbohydrates per serving, and Equipment into one section.
   - **For every piece of equipment, tool, or appliance, include the brand or model if it is shown, mentioned, or can be reasonably identified.**
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
[Emoji] [Quantity] [Ingredient Description, **including brand if shown or mentioned**]  
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
**Equipment:** [List of equipment, **including brand or model if shown or mentioned**]  

---

**Cooking Tips:**  
- [Tip 1]
- [Tip 2]

---

#[Hashtags]

---

YouTube channel - [Channel Name]: [YouTube URL]

---

I will give you the recipe next and you give me the edited text in markdown so I can copy and paste it.
Remember to put a separator after the instructions section and another separator before cooking tips.
Please ensure the final output is in Markdown that can be copied and pasted directly, and do not use triple backticks or any wrapping code blocks.
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
  [SOURCE_TYPES.TIKTOK]: getTiktokDraft,
  [SOURCE_TYPES.TUTORIAL_TIKTOK]: getTiktokDraft,
  [SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM]: getInstagramDraft,
  [SOURCE_TYPES.DRAFT_INSTAGRAM]: getInstagramDraft,
  [SOURCE_TYPES.INSTAGRAM]: getInstagramDraft,
  [SOURCE_TYPES.TUTORIAL_INSTAGRAM]: getInstagramDraft,
  [SOURCE_TYPES.RECIPE_DRAFT]: getYoutubeDraft,
  [SOURCE_TYPES.DRAFT_YOUTUBE]: getYoutubeDraft,
  [SOURCE_TYPES.YOUTUBE]: getYoutubeDraft,
  [SOURCE_TYPES.TUTORIAL_YOUTUBE]: getYoutubeDraft,
  default: getYoutubeDraft,
};

export const getDraftBodyTitleTags = async (
  source: string,
  bodyFromEditor?: string,
): Promise<Draft|null> => {
  emitLoadingEvent('draft-refresh-start', {
    step: 'Starting draft refresh',
    message: 'Refreshing draft content...',
    progress: 0,
  });

  const getBody = source ? draftBySiteHandler[source] : draftBySiteHandler.default;

  emitLoadingEvent('draft-refresh-step', {
    step: 'Extracting content',
    message: 'Extracting video content...',
    progress: 25,
  });

  const {
    title, body, attribution, link, author,
  } = await getBody();

  if (!body) {
    emitLoadingEvent('draft-refresh-error', {
      step: 'Content extraction failed',
      message: 'Parsing post body error',
      progress: 100,
    });
    alert('Parsing post body error');
    return null;
  }

  emitLoadingEvent('draft-refresh-step', {
    step: 'Generating content',
    message: 'Generating new draft content...',
    progress: 50,
  });

  const query = createQuery({
    subs: bodyFromEditor || `${title} ${body}`, source,
  });
  const { result: postDraft, error } = await getGptAnswer(query);
  if (!postDraft) {
    emitLoadingEvent('draft-refresh-error', {
      step: 'Content generation failed',
      message: `Gpt error ${(error as Error)?.message ?? ''}`,
      progress: 100,
    });
    alert(`Gpt error ${(error as Error)?.message ?? ''}`);
    return null;
  }

  emitLoadingEvent('draft-refresh-step', {
    step: 'Formatting content',
    message: 'Formatting draft content...',
    progress: 75,
  });

  const draftBody = formatGptAnswer({
    answer: postDraft, link, attribution,
  });

  const tags = formatHashTags(draftBody, author);
  const authorTag = makeValidTag(author);

  const resultBody = await getGptMarkdownFormat(draftBody, source || '');

  const result = {
    body: `${resultBody}\n#${authorTag}\n\n`,
    title,
    tags,
  };

  emitLoadingEvent('draft-refresh-complete', {
    step: 'Draft refresh complete',
    message: 'Draft content refreshed successfully',
    progress: 100,
    data: result,
  });

  return result;
};

export const initialDeepAnalysis = async (source:string): Promise<Draft|null> => {
  emitLoadingEvent('deep-analysis-start', {
    step: 'Starting deep analysis',
    message: 'Initializing analysis process...',
    progress: 0,
  });

  const getBody = source ? draftBySiteHandler[source] : draftBySiteHandler.default;

  emitLoadingEvent('deep-analysis-step', {
    step: 'Extracting content',
    message: 'Extracting video content and metadata...',
    progress: 20,
  });

  const {
    title, body, attribution, link, author,
  } = await getBody();

  emitLoadingEvent('deep-analysis-step', {
    step: 'Content extracted',
    message: `Found content from ${author || 'unknown author'}`,
    progress: 40,
    data: { title, author },
  });

  const content = `${author ? `video author: ${author}` : ''} video description: ${title}${body}`;

  emitLoadingEvent('deep-analysis-step', {
    step: 'Creating AI prompt',
    message: 'Preparing AI analysis prompt...',
    progress: 50,
  });

  const prompt = createAnalysisVideoPromptBySource(source, content);

  emitLoadingEvent('deep-analysis-step', {
    step: 'AI analysis',
    message: 'Analyzing content with AI...',
    progress: 60,
  });

  const response = await videoAnalysesByLink(prompt, document.URL);

  if (!body && !response.result) {
    emitLoadingEvent('deep-analysis-error', {
      step: 'Analysis failed',
      message: 'Can\'t process Video',
      progress: 100,
    });
    alert('Can\'t process Video');
    return null;
  }

  emitLoadingEvent('deep-analysis-step', {
    step: 'AI analysis complete',
    message: 'AI analysis completed successfully',
    progress: 70,
    data: response.result,
  });

  let postBody = response.result || body;

  if ([SOURCE_TYPES.TUTORIAL_INSTAGRAM, SOURCE_TYPES.TUTORIAL_TIKTOK, SOURCE_TYPES.TUTORIAL_YOUTUBE].includes(source)) {
    emitLoadingEvent('deep-analysis-step', {
      step: 'Additional tutorial processing',
      message: 'Formating video analyses response...',
      progress: 80,
    });
    postBody = formatGptAnswer({
      answer: postBody, link, attribution,
    });

    const context = `attribution: ${attribution}, link: ${link}, author: ${author}, content: ${postBody}`;
    const { result: formattedResponse } = await getGptAnswer(formatTutorialPrompt(context));
    if (formattedResponse) postBody = formattedResponse;
  }

  if ([SOURCE_TYPES.DRAFT_YOUTUBE, SOURCE_TYPES.DRAFT_INSTAGRAM, SOURCE_TYPES.DRAFT_TIKTOK].includes(source)) {
    emitLoadingEvent('deep-analysis-step', {
      step: 'Additional review processing',
      message: 'Formating video analyses response...',
      progress: 80,
    });
    postBody = formatGptAnswer({
      answer: postBody, link, attribution,
    });

    const context = `attribution: ${attribution}, link: ${link}, author: ${author}, content: ${postBody}`;
    const { result: formattedResponse } = await getGptAnswer(formatReviewPrompt(context));

    if (formattedResponse) postBody = formattedResponse;
  }

  if (RECIPE_SOURCE_TYPES.includes(source)) {
    emitLoadingEvent('deep-analysis-step', {
      step: 'Recipe processing',
      message: 'Processing recipe content...',
      progress: 80,
    });

    const query = createQuery({
      subs: `${title} ${postBody}`, source,
    });

    const { result: postDraft, error } = await getGptAnswer(query);

    if (!postDraft) {
      emitLoadingEvent('deep-analysis-error', {
        step: 'Recipe processing failed',
        message: `Gpt error ${(error as Error)?.message ?? ''}`,
        progress: 100,
      });
      alert(`Gpt error ${(error as Error)?.message ?? ''}`);
      return null;
    }

    const formattedText = formatGptAnswer({
      answer: postDraft, link, attribution,
    });

    postBody = await getGptMarkdownFormat(formattedText, source || '');
  }

  emitLoadingEvent('deep-analysis-step', {
    step: 'Finalizing',
    message: 'Finalizing post content...',
    progress: 90,
  });

  const tags = formatHashTags(postBody, author);
  const authorTag = makeValidTag(author);

  const result = {
    body: `${postBody}\n#${authorTag}\n\n`,
    title,
    tags,
  };

  emitLoadingEvent('deep-analysis-complete', {
    step: 'Analysis complete',
    message: 'Deep analysis completed successfully',
    progress: 100,
    data: result,
  });

  return result;
};

export const createUnifiedModal = async (source: string, commandType: string): Promise<void> => {
  const userInfo = await getWaivioUserInfo();
  if (!userInfo) return;
  const { userName } = userInfo;

  const host = await getPostImportHost(userName) || 'www.waivio.com';

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(
    <CreatePostModal
      title=""
      body=""
      tags={[]}
      author={userName}
      host={host}
      source={source}
      commandType={commandType}
    />,
  );
};

export const createDraft = async (source: string): Promise<void> => {
  await createUnifiedModal(source, 'CREATE_DRAFT');
};
