import { RECIPE_SOURCE_TYPES } from '../../common/constants';

const recipeVideoPrompt = `Analyze the provided cooking video thoroughly and extract as much information as possible the following. Include the following details:

1. Recipe Overview:
Brief description or gist of the recipe.

Type of cuisine and dish category (e.g., appetizer, main course, dessert).

2. Key Ingredients:
List all the main ingredients mentioned, including quantities and measurements.

3. Preparation Time:
Total preparation time mentioned or inferred from the video.

Cooking and resting times separately, if applicable.

4. Cooking Instructions:
Provide step-by-step cooking instructions in chronological order, clearly indicating each action taken.

5. Special Techniques or Tips:
Highlight any special cooking techniques, chef's tips, or important notes mentioned in the video.

6. Serving Suggestions:
Describe recommended serving methods, garnishes, side dishes, or beverages suggested.

7. Visual Observations:
Note any important visual cues, such as color or texture changes indicating the readiness of the dish.

Provide the information clearly structured and organized under each heading. 
Don't use phrases like “here's your answer” in your answer, don't repeat the assignment.`;

const regularVideoPrompt = 'Analyze the video and provide a detailed step-by-step scenario script';

export const createAnalysisVideoPromptBySource = (source:string): string => {
  if (RECIPE_SOURCE_TYPES.includes(source)) return recipeVideoPrompt;
  return regularVideoPrompt;
};
