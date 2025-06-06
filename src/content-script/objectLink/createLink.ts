import html2canvas from 'html2canvas';
import { downloadToWaivio, getLinkByBody, loadImageBase64 } from '../helpers/downloadWaivioHelper';

const extractName = (url: string): string => url
  .replace(/^(https?:\/\/)?(www\.)?/, '')
  .replace(/\/$/, '');

const extractTitleFromDocument = (): string => {
  const titleElement = document.querySelector('title');
  return titleElement ? titleElement.textContent || '' : '';
};

const extractDescriptionFromDocument = () :string => {
  const el = document.querySelector<HTMLMetaElement>('meta[name=description]');
  if (!el) return '';
  return el.content;
};

const extractAvatarFromDocument = ():string => {
  const el = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (!el) return '';
  return el.content;
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

export const makeBlobFromHtmlPage = async (cropHeight = true):Promise<Blob |null> => {
  try {
    const body = document.querySelector('body');
    if (!body) return null;

    const width = Math.max(1, window.innerWidth);
    const height = cropHeight
      ? Math.max(1, window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth)
      : Math.max(1, window.innerHeight);

    // Use a Promise to handle the asynchronous nature of html2canvas
    const canvas = await html2canvas(body, {
      useCORS: true,
      width,
      height,
      scale: 1,
      allowTaint: true,
      foreignObjectRendering: false,
      removeContainer: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Remove any problematic gradient elements
        const gradients = clonedDoc.querySelectorAll('[style*="gradient"]');
        gradients.forEach((gradient) => {
          const element = gradient as HTMLElement;
          if (element) {
            element.setAttribute('style', 'background: #ffffff');
          }
        });
      },
    });

    // Convert the canvas to a Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    return null;
  }
};

export const createLink = async (source?: string) => {
  const name = extractName(document.URL);

  const fieldUrl = document.URL;
  const fieldTitle = extractTitleFromDocument();
  const fieldDescription = extractDescriptionFromDocument();

  const link = await getLinkByBody(fieldUrl, 'link');
  if (link) {
    const proceed = window.confirm(`This object already exists on Waivio https://www.waivio.com/object/${link} do you want to proceed?`);
    if (!proceed) return;
  }

  const primaryImageURLs = [];
  const imageURLs = [];

  const avatar = extractAvatarFromDocument();
  if (avatar) primaryImageURLs.push(avatar);

  const imageBlob = await makeBlobFromHtmlPage();
  if (imageBlob) {
    const { result } = await loadImageBase64(imageBlob);
    if (result) imageURLs.push(result);
  }

  const object = {
    name,
    fieldUrl,
    fieldTitle,
    fieldDescription,
    primaryImageURLs,
    imageURLs,
  };

  await downloadToWaivio({ object, objectType: 'link' });
};
