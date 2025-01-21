import { DEPARTMENT_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';
import { formatResponseToValidJson, getGptAnswer } from '../helpers/gptHelper';

const parseJson = (json: string): any => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

export const getDepartmentsAmazon = ():string[] => {
  const departments = [];
  const liArr = Array.from(document.querySelectorAll<HTMLElement>(DEPARTMENT_SELECTOR.MAIN));

  for (const liArrElement of liArr) {
    const department = liArrElement?.innerText ?? '';
    if (department) departments.push(replaceInvisible(department));
  }
  return departments;
};

export const getDepartmentsSephora = ():string[] => {
  const departments = [];
  const departmentElements = Array.from(
    document.querySelectorAll<HTMLElement>(DEPARTMENT_SELECTOR.SEPHORA),
  );

  for (const departmentElement of departmentElements) {
    const department = departmentElement?.innerText ?? '';
    if (department) departments.push(replaceInvisible(department));
  }
  return departments;
};

export const getDepartmentsFromProductDescription = async (description: string)
    : Promise<string[]> => {
  const query = `create categories up to 5 for product return response as array of strings there should be 1 main category and sub-categories: 
example input: 6/8cm 3D Crystal Ball Planet Night Light Laser Engraved Solar System Globe Astronomy Festival Gifts Home Desktop Decoration
example output:
["Home Decor", "Lighting and Lamps", "Night Lights", "Desktop Decorations", "Astronomy Decor"]
here is product for processing: ${description}. response only with json array of strings`;

  const { result, error } = await getGptAnswer(query);
  if (error) return [];

  const formatted = formatResponseToValidJson(result);

  const response = parseJson(formatted) as string[] | null;
  console.log('json', response);
  if (!response) return [];

  return response;
};

export const getDepartmentsWalmart = ():string[] => {
  const departments = [];
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>('nav[aria-label="breadcrumb"] li'),
  )
    .map((el) => el?.innerText?.replace(/\//, ''));

  for (const departmentElement of elements) {
    if (departmentElement) departments.push(replaceInvisible(departmentElement));
  }

  return departments;
};
