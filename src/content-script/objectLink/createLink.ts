import html2canvas from 'html2canvas';
import { downloadToWaivio, loadImageBase64 } from '../helpers/downloadWaivioHelper';

const extractHostname = (url: string): string => {
  // Remove protocol and get the hostname part
  let hostname;
  // Find & remove protocol (http, https, ftp, etc.) and get the hostname
  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  // Find & remove port number
  hostname = hostname.split(':')[0];
  // Find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
};

const extractTitleFromDocument = (): string => {
  const titleElement = document.querySelector('title');
  return titleElement ? titleElement.textContent || '' : '';
};

const takeScreenshot = () => {
  const body = document.querySelector('body');
  if (!body) return;
  html2canvas(body, {
    useCORS: true,
    width: window.innerWidth,
    height: window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth,
  }).then((canvas) => {
    // Convert the canvas to a data URL
    const dataURL = canvas.toDataURL('image/png');

    // Create an image element
    const img = document.createElement('img');
    img.src = dataURL;

    // Append the image to the body
    document.body.appendChild(img);

    // Optionally, you can also download the image
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'screenshot.png';
    link.click();
  });
};

const makeBlobFromHtmlPage = async ():Promise<Blob |null> => {
  const body = document.querySelector('body');
  if (!body) return null;

  // Use a Promise to handle the asynchronous nature of html2canvas
  const canvas = await html2canvas(body, {
    useCORS: true,
    width: window.innerWidth,
    height: window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth,
  });

  // Convert the canvas to a Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};

export const createLink = async (source?: string) => {
  const name = extractHostname(document.URL);
  const fieldUrl = source ? `${document.URL}*` : document.URL;
  const fieldTitle = extractTitleFromDocument();

  const primaryImageURLs = [];

  const imageBlob = await makeBlobFromHtmlPage();
  if (imageBlob) {
    const { result } = await loadImageBase64(imageBlob);
    if (result) primaryImageURLs.push(result);
  }

  const object = {
    name,
    fieldUrl,
    fieldTitle,
    primaryImageURLs,
  };

  await downloadToWaivio({ object, objectType: 'link' });

  console.log(object);
};
