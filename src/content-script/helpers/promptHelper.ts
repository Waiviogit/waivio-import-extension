import { RECIPE_SOURCE_TYPES } from '../../common/constants';

const recipeVideoPrompt = (content = '') => `
You are given the video **title and description** below, which may provide useful context about the video’s content:
---
${content}
---

Analyze the provided cooking video thoroughly and extract as much information as possible the following. Include the following details:


1. Recipe Overview:
Brief description or gist of the recipe.

Type of cuisine and dish category (e.g., appetizer, main course, dessert).

2. Key Ingredients:
List all the main ingredients mentioned, including quantities and measurements.

3. Nutrition facts per serving:
Calories, Proteins, fats and carbohydrates per serving.

4. Preparation Time:
Total preparation time mentioned or inferred from the video.

Cooking and resting times separately, if applicable.

5. Cooking Instructions:
Provide step-by-step cooking instructions in chronological order, clearly indicating each action taken.

6. Special Techniques or Tips:
Highlight any special cooking techniques, chef's tips, or important notes mentioned in the video.

7. Serving Suggestions:
Describe recommended serving methods, garnishes, side dishes, or beverages suggested.

8. Visual Observations:
Note any important visual cues, such as color or texture changes indicating the readiness of the dish.

Provide the information clearly structured and organized under each heading. 
Don't use phrases like “here's your answer” in your answer, don't repeat the assignment.`;

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

export const createAnalysisVideoPromptBySource = (source:string, content: string): string => {
  if (RECIPE_SOURCE_TYPES.includes(source)) return recipeVideoPrompt(content);
  return regularVideoPrompt(content);
};
