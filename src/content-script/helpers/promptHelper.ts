import { RECIPE_SOURCE_TYPES, TUTORIAL_SOURCE_TYPES } from '../../common/constants';

const recipeVideoPrompt = (content = '') => `
You are given the video **title and description** below, which may provide useful context about the video’s content:
---
${content}
---

Analyze the provided cooking video thoroughly and extract as much information as possible in the following categories. For each, follow the specific instructions:

1. Recipe Overview:
- Briefly describe the recipe.
- State the type of cuisine and dish category (e.g., appetizer, main course, dessert).

2. Key Ingredients and Brands:
- List **all main ingredients** mentioned or visually shown, including quantities and measurements(dont use words as generic, to taste etc, try predict).
- **For each ingredient, identify the brand or specific product shown, if visible or mentioned.**

3. Equipment and Brands:
- List **all cooking equipment, tools, or appliances** used or shown in the video.
- **Specify the brand or model** for each, if it is visible, mentioned, or can be reasonably identified.

4. Nutrition Facts per Serving:
- Provide calories, proteins, fats, and carbohydrates per serving.

5. Preparation Time:
- State the total preparation time mentioned or inferred from the video.
- Specify cooking and resting times separately, if applicable.

6. Cooking Instructions:
- Provide step-by-step cooking instructions in chronological order, clearly indicating each action taken.

7. Special Techniques or Tips:
- Highlight any special cooking techniques, chef's tips, or important notes mentioned.

8. Serving Suggestions:
- Describe recommended serving methods, garnishes, side dishes, or beverages suggested.

9. Visual Observations:
- Note any important visual cues, such as color or texture changes indicating the readiness of the dish.

Ensure the information is clearly structured under each heading, and do **not** use phrases like “here's your answer” or repeat the assignment wording in your response.
`;

const regularVideoPrompt = (content: string) => `
You are an expert media analyst.

You are given the video **title and description** below, which may provide useful context about the video’s content, people, places, or products:
---
${content}
---

Analyze the video and provide the following:

1. **Step-by-step scenario:**  
   - Describe the sequence of events and key actions.  
   - Use details from the title/description to clarify or enrich your summary if relevant.  
   - Summarize scenes where possible, but keep important moments detailed.  
   - Do NOT include timestamps.

2. **Products featured:**  
   - List all visible products, devices, or branded items (e.g., MacBook Pro 16", coffee mug, Ray-Ban glasses).  
   - For each, mention the context in which it appears, using hints from the title/description where possible.

3. **Places shown:**  
   - List all locations from video try name location if possible if it business, restaurant e.t.c (e.g., Canary Islands, Egyptian Pyramids, Buenos Aires Airport, McDonald's).  
   - If the place is not explicitly named, describe it briefly (e.g., "modern office," "beach at sunset") and use information from the title/description to improve accuracy.

4. **People identified:**  
   - List all people shown.  
   - Use full names if recognized (e.g., Tom Cruise, Angelina Jolie).  
   - If the title/description helps identify someone or clarify their role, mention that.  
   - People on the video could be author of content mentioned earlier.
   - Otherwise, briefly describe (e.g., "young woman with red hair," "elderly man in uniform") and mention notable actions or roles.

**Format your response in clearly separated, numbered sections as above. Be concise but informative. If any category is not present in the video, write "None."**
`;

const impersonalTutorialVideoPrompt = (content: string) => `
I have a video that needs content analysis. 
You are an expert tutorial writer.

You are given a video **title and description** below: ${content}. Use this context to create a clear, impersonal tutorial post.

**Requirements:**
- Start directly with the tutorial title. Do not include any introduction, summary, or commentary before the title.
- Write step-by-step instructions in the format "Step 1", "Step 2", etc.
- Do not mention any people by name or refer to personal actions. Focus only on the process.
- For each step, describe the action to be taken, mentioning any products, brands, or places naturally in the instructions.
- Mention the environment/location if relevant (e.g., "in a spacious home with high ceilings").
- At the end, add three sections:
  1. **Products Used:** List each product mentioned with brand.
  2. **Author:** Attribute the tutorial to the original creator or channel as indicated in the title/description (e.g., "#isabellemcfive" or "@TheMcFiveCircus").
  3. **Brand Tags:** Collect and list all unique brand tags from the products in a separate block at the bottom (e.g., "#nike").

- Do not include timestamps, personal names, or narrative.
`;

export const createAnalysisVideoPromptBySource = (source:string, content: string): string => {
  if (RECIPE_SOURCE_TYPES.includes(source)) return recipeVideoPrompt(content);
  if (TUTORIAL_SOURCE_TYPES.includes(source)) return impersonalTutorialVideoPrompt(content);
  return regularVideoPrompt(content);
};

export const formatTutorialPrompt = (context: string) => `
You are an expert tutorial writer.

You are given context: ${context}. Use this context to create a clear, impersonal tutorial post.

**Requirements:**
- Start directly with the tutorial title. Do not include any introduction, summary, or commentary before the title.
- Write step-by-step instructions in the format "Step 1", "Step 2", etc.
- Do not mention any people by name or refer to personal actions. Focus only on the process.
- For each step, describe the action to be taken, mentioning any products, brands, or places naturally in the instructions.
- Mention the environment/location if relevant (e.g., "in a spacious home with high ceilings").
- At the end, add three sections:
  1. **Products Used:** List each product mentioned with brand.
  2. **Author:** Attribute the tutorial to the original creator or channel as indicated in the title/description (e.g., "#isabellemcfive" or "@TheMcFiveCircus").
  3. **Brand Tags:** Collect and list all unique brand tags from the products in a separate block at the bottom (e.g., "#nike").

- Do not include timestamps, personal names, or narrative.
Include the reviewer's name (if available) and their channel link, link to the video.
`;

export const formatReviewPrompt = (context:string) => `
You are given context: ${context}. Use this context to:
Write a friendly summary post for a product(s) review video from a third-party creator.
Include the reviewer's name (if available) and their channel link, link to the video. 
Summarize the main points of the review in a fun and engaging tone, and mention any products highlighted. 
Make sure to credit the creator and invite readers to watch the full video on their channel. 
Add a list of featured products, add appropriate hashtags.`;
