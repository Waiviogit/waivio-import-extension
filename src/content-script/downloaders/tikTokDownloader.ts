export const getTikTokDownloadUrl = (): string => Array.from(document.querySelectorAll<HTMLSourceElement>('video source'))?.[1].src || '';

export const getTiktokDataBlob = async (): Promise<Blob> => {
  const downloadUrl = getTikTokDownloadUrl();
  if (!downloadUrl) throw new Error('Cant get tiktok download url');
  const blob = await fetch(downloadUrl).then((res) => res.blob());
  return blob;
};
