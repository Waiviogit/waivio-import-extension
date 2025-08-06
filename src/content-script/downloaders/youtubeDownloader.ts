export const getYoutubeThumbnail = () => {
  const regex = /(?:watch\?v=|\/shorts\/)([^&/]+)/;
  const match = document.URL.match(regex);
  if (!match && !match?.[1]) return '';
  const imageUrl = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  return imageUrl;
};
