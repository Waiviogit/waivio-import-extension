import { DEPARTMENT_SELECTOR } from '../constants';

export const getDepartments = ():string[] => {
  const departments = [];
  const liArr = Array.from(document.querySelectorAll<HTMLElement>(DEPARTMENT_SELECTOR.MAIN));

  for (const liArrElement of liArr) {
    const department = liArrElement?.innerText ?? '';
    if (department) departments.push(department);
  }
  return departments;
};
