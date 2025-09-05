import { getHivePostFromDocUrl } from '../helpers/hivePostHelper';

export const getThreeSpeakDataBlob = async () => {
  const post = await getHivePostFromDocUrl();
  if (!post) throw new Error('cant find post');

  const metadata = JSON.parse(post.json_metadata); console.log(metadata?.video);

  const ipfsUrl = metadata?.video?.info?.file;
  if (!ipfsUrl) throw new Error('No video on post');

  const downloadUrl = `https://ipfs-3speak.b-cdn.net/ipfs/${ipfsUrl.replace(/ipfs:\/\//, '')}`;

  console.log(downloadUrl);

  if (!downloadUrl) throw new Error('Cant get tiktok download url');
  return downloadUrl;
};

type ThreeSpeakSourceMap = {
  type: string
  url: string
}

export const getThreeSpeakThumbnail = async () => {
  try {
    const post = await getHivePostFromDocUrl();
    if (!post) throw new Error('cant find post');

    const metadata = JSON.parse(post.json_metadata); console.log(metadata?.video);
    console.log(metadata);

    const sourceMap = metadata?.video?.info?.sourceMap as ThreeSpeakSourceMap[]
        || [];

    const ipfs = sourceMap.find((el) => el.type === 'thumbnail');
    if (!ipfs) throw new Error('No video on post');

    return `https://ipfs-3speak.b-cdn.net/ipfs/${ipfs.url.replace(/ipfs:\/\//, '')}`;
  } catch (error) {
    return '';
  }
};
