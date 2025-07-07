import axios from 'axios';

interface TilkyData {
  video:{
    noWatermark: string
  }
}
// https://github.com/MRHRTZ/Tiktok-Scraper-Without-Watermark/blob/main/src/function/index.js

function tiklydown(url: string): Promise<TilkyData> {
  return new Promise((resolve, reject) => {
    axios.get(`https://api.tiklydown.eu.org/api/download?url=${url}`)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export const getTiktokDataBlob = async (): Promise<Blob> => {
  const data = await tiklydown(document.URL);
  const downloadUrl = data.video.noWatermark;

  if (!downloadUrl) throw new Error('Cant get tiktok download url');
  const blob = await fetch(downloadUrl).then((res) => res.blob());
  return blob;
};
