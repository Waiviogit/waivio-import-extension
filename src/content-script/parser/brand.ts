export const getBrand = (): string => {
  const brandElements = document.querySelectorAll('#productOverview_feature_div .po-brand span');
  const innerHtml = [];
  // @ts-ignore
  for (const innerHtmlElement of brandElements) {
    const text = innerHtmlElement.innerHTML;
    if (text) innerHtml.push(text.trim());
  }
  return innerHtml.length === 2 ? innerHtml[1] : '';
};
