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
  const blob = await fetch(downloadUrl).then((res) => res.blob());
  return blob;
};
