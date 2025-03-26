import { RECIPE_SOURCE_TYPES } from '../../common/constants';

const recipeVideoPrompt = `Analyze the provided cooking video thoroughly and extract the following details clearly and concisely:

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

const regularVideoPrompt = `Analyze the provided video to extract and summarize its essential information clearly. Include the following key aspects:

Main Topic and Objective:
Briefly identify the primary focus and purpose of the video.

Key Points and Arguments:
List the main ideas, arguments, or concepts presented, along with relevant examples.

Participants and Roles (if applicable):
Mention key speakers, their roles, or their expertise.

Important Data or Statistics:
Highlight any critical data, statistics, or facts mentioned in the video.

Conclusions and Recommendations:
Summarize the key conclusions drawn and recommendations made in the video.

Visual and Contextual Information (if relevant):
Describe significant visual elements, diagrams, charts, or context provided visually.

Any Notable Quotes or Statements:
Include critical quotes or notable statements that encapsulate key points from the video.

Overall Impression and Utility:
Provide a brief assessment of the video’s clarity, usefulness, and effectiveness in conveying its message.`;

export const createAnalysisVideoPromptBySource = (source:string): string => {
  if (RECIPE_SOURCE_TYPES.includes(source)) return recipeVideoPrompt;
  return regularVideoPrompt;
};
