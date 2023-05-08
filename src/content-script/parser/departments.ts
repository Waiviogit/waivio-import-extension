export const getDepartments = ():string[] => {
  const departments = [];
  const liArr = document.querySelectorAll('#wayfinding-breadcrumbs_feature_div li:not(.a-breadcrumb-divider)');

  // @ts-ignore
  for (const liArrElement of liArr) {
    const department = liArrElement?.innerText ?? '';
    if (department) departments.push(department);
  }
  return departments;
};
