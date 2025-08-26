import html2canvas from 'html2canvas';
import { downloadToWaivio, getLinkByBody, loadImageBase64 } from '../helpers/downloadWaivioHelper';
import { captureVisibleTab } from '../../services/chromeHelper';

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

const dataUrlToBlob = async (dataUrl: string): Promise<Blob | null> => {
  try {
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (e) {
    try {
      const parts = dataUrl.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (err) {
      return null;
    }
  }
};

const createMinimalScreenshot = async (cropHeight = true): Promise<Blob | null> => {
  try {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth);

    // Create a canvas with basic page info
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = cropHeight ? height : width;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, cropHeight ? height : width);

    // Add page title
    const title = document.title || 'Page Screenshot';
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(title, 20, 30);

    // Add URL
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666666';
    const url = document.URL;
    ctx.fillText(url, 20, 50);

    // Add timestamp
    const timestamp = new Date().toLocaleString();
    ctx.fillText(`Screenshot taken: ${timestamp}`, 20, 70);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Minimal screenshot failed:', error);
    return null;
  }
};

const makeBlobFromHtmlPageFallback = async (cropHeight = true): Promise<Blob | null> => {
  try {
    const body = document.querySelector('body');
    if (!body) return null;

    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth);

    // Create a temporary container in the current document
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = `${width}px`;
    tempContainer.style.height = `${height}px`;
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.backgroundColor = '#ffffff';

    // Clone the body content
    const clonedContent = body.cloneNode(true) as HTMLElement;

    // Remove all problematic elements from the clone
    const scripts = clonedContent.querySelectorAll('script');
    scripts.forEach((script) => script.remove());

    const iframes = clonedContent.querySelectorAll('iframe');
    iframes.forEach((iframe) => iframe.remove());

    const externalLinks = clonedContent.querySelectorAll('link[rel="stylesheet"][href^="http"]');
    externalLinks.forEach((link) => link.remove());

    // Remove elements with external sources that might cause CORS issues
    const externalElements = clonedContent.querySelectorAll('[src^="http"], [href^="http"]');
    externalElements.forEach((element) => {
      const el = element as HTMLElement;
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'AUDIO') {
        el.remove();
      }
    });

    // Remove elements that might cause addEventListener errors
    const interactiveElements = clonedContent.querySelectorAll('[data-js], [class*="js-"], [id*="js-"]');
    interactiveElements.forEach((element) => {
      const el = element as HTMLElement;
      // Remove event listeners by cloning the element
      const newEl = el.cloneNode(false) as HTMLElement;
      newEl.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(newEl, el);
    });

    // Clean up problematic CSS that might cause parsing errors
    const allElements = clonedContent.querySelectorAll('*');
    allElements.forEach((element) => {
      const el = element as HTMLElement;
      if (el.style) {
        try {
          // Replace problematic color functions with safe values
          const style = el.style.cssText;
          const cleanStyle = style
            .replace(/color\([^)]*\)/g, '#000000')
            .replace(/rgb\([^)]*\)/g, '#000000')
            .replace(/hsl\([^)]*\)/g, '#000000')
            .replace(/rgba\([^)]*\)/g, '#000000')
            .replace(/hsla\([^)]*\)/g, '#000000');
          el.style.cssText = cleanStyle;
        } catch (e) {
          // If style manipulation fails, remove the style attribute
          el.removeAttribute('style');
        }
      }
    });

    // Add the cleaned content to the temporary container
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvas(tempContainer, {
        useCORS: false,
        width,
        ...(cropHeight && { height }),
        scale: 1,
        allowTaint: true,
        foreignObjectRendering: false,
        removeContainer: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (element) => {
          // Ignore any remaining problematic elements
          const tagName = element.tagName?.toLowerCase();
          if (tagName === 'script' || tagName === 'iframe') {
            return true;
          }
          return false;
        },
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } finally {
      // Clean up the temporary container
      if (tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  } catch (error) {
    console.error('Screenshot fallback failed:', error);
    return null;
  }
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
    const height = Math.max(1, window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth);

    // Use a Promise to handle the asynchronous nature of html2canvas
    const canvas = await html2canvas(body, {
      useCORS: true,
      width,
      ...(cropHeight && { height }),
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
    // Fallback 1: background captureVisibleTab
    const dataUrl = await captureVisibleTab();
    if (dataUrl) {
      const blob = await dataUrlToBlob(dataUrl);
      if (blob) {
        console.log('captureVisibleTab successfully');
        return blob;
      }
    }

    // Fallback 2: try with more aggressive DOM clone + html2canvas
    const fallbackResult = await makeBlobFromHtmlPageFallback(cropHeight);
    if (fallbackResult) return fallbackResult;

    // Fallback 3: create a minimal screenshot with just text content
    return createMinimalScreenshot(cropHeight);
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
