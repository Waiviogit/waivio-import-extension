import { extractVideoId } from '../helpers/youtubeHelper';

export const getYoutubeThumbnail = () => {
  const id = extractVideoId(document.URL);
  if (!id) return '';
  const imageUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  return imageUrl;
};
