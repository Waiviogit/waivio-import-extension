export const getDescription = (): string => {
  const bulletPoints = document.querySelectorAll('#featurebullets_feature_div li span');
  const textPoints = [];
  // @ts-ignore
  for (const bulletPoint of bulletPoints) {
    const point = bulletPoint.innerText ?? '';
    if (point) textPoints.push(point.trim());
  }
  return textPoints.join('');
};
