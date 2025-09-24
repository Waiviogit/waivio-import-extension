import { getHivePostFromDocUrl } from '../helpers/hivePostHelper';

export const getThreeSpeakDataBlob = async () => {
  const post = await getHivePostFromDocUrl();
  if (!post) throw new Error('cant find post');

  const metadata = JSON.parse(post.json_metadata); console.log(metadata?.video);

  const ipfsUrl = metadata?.video?.info?.file;
  if (!ipfsUrl) throw new Error('We couldn’t process the video. Please try using a direct video link. Some videos may not be processed due to technical limitations.');

  const downloadUrl = `https://ipfs-3speak.b-cdn.net/ipfs/${ipfsUrl.replace(/ipfs:\/\//, '')}`;
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
    if (!ipfs) {
      const image = metadata?.image?.[0] as string | undefined;
      if (image) return image;
      throw new Error('No video on post');
    }

    return `https://ipfs-3speak.b-cdn.net/ipfs/${ipfs.url.replace(/ipfs:\/\//, '')}`;
  } catch (error) {
    return '';
  }
};
