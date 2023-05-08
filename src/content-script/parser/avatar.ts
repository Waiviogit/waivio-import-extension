export const getAvatar = ():string => {
  const image = document.querySelector('#imgTagWrapperId img');
  // @ts-ignore
  return image?.src ?? '';
};
