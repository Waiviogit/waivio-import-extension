import { DEPARTMENT_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

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
