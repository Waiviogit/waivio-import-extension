import { replaceInvisible } from '../helpers/commonHelper';
import { classSelectorByRegex } from '../helpers/scrapingHelper';

export const getAvatarAmazon = () => {
  const gallery = Array.from(document.querySelectorAll<HTMLElement>('li.imageThumbnail'));
  for (const item of gallery) {
    item.click();
  }
  const avatar = document.querySelector<HTMLImageElement>('li[data-csa-c-posy="1"] .imgTagWrapper img')
      || document.querySelector<HTMLImageElement>('#imageBlockContainer img:not(#sitbLogoImg)');

  if (!avatar?.src) {
    const audiobookAvatar = document.querySelector<HTMLImageElement>('#audibleimageblock_feature_div img')?.src;

    return audiobookAvatar ?? '';
  }

  return replaceInvisible(avatar?.src) ?? '';
};

type AvatarGalleryType= {
  avatar: string;
  gallery: string[];
}
export const getAvatarSephora = ():AvatarGalleryType => {
  const pictures = Array.from(document.querySelectorAll<HTMLImageElement>('foreignObject img')).map((el) => el.src);
  if (!pictures.length) {
    return {
      avatar: '',
      gallery: [],
    };
  }
  const avatar = pictures[0];
  const gallery = pictures.slice(1);

  return {
    avatar,
    gallery,
  };
};

const transformAliExpressUrls = (urls:string[]): string[] => {
  const transformedUrls = urls.map((url) => url.replace('.jpg_220x220q75.jpg_.avif', '.jpg_960x960q75.jpg_.avif'));
  const uniqueUrls = [...new Set(transformedUrls)];
  return uniqueUrls;
};

export const getAvatarAliexpress = ():AvatarGalleryType => {
  const pictures = Array.from(document.querySelectorAll<HTMLImageElement>('.pdp-info-left img')).map((el) => el.src);

  if (!pictures.length) {
    return {
      avatar: '',
      gallery: [],
    };
  }

  const [avatarElement] = classSelectorByRegex('div', /slider--active--/);
  if (!avatarElement) {
    return {
      avatar: '',
      gallery: [],
    };
  }

  // @ts-ignore
  const avatar = (avatarElement?.firstChild?.src || '').replace('.jpg_220x220q75.jpg_.avif', '.jpg_960x960q75.jpg_.avif');

  const images = transformAliExpressUrls(pictures);
  const gallery = images.filter((el) => el !== avatar);

  return {
    avatar,
    gallery,
  };
};

export const getAvatarWalmart = (): AvatarGalleryType => {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('div[data-testid="vertical-carousel-container"] img'),
  )
    .map((el) => el?.src?.replace(/\?.+/, ''));

  const avatar = images[0];
  const gallery = images.slice(1);

  return {
    avatar,
    gallery,
  };
};

export const getAvatarInstacart = (): AvatarGalleryType => {
  const avatar = document.querySelector<HTMLImageElement>('div .ic-image-zoomer img')?.src || '';
  if (!avatar) {
    const links = Array.from(document.querySelectorAll<HTMLImageElement>('div picture img')).map((v) => v.srcset.split(',')[0].trim().replace(/\/(86|68)x(86|68)\//g, '/466x466/')).filter((v) => /product-image/.test(v)).filter((el, index, self) => index === self.indexOf(el));
    if (links.length) {
      return {
        avatar: links[0],
        gallery: links.slice(1),
      };
    }
    return {
      avatar: '',
      gallery: [],
    };
  }

  const gallery = Array.from(document.querySelectorAll<HTMLImageElement>('ul li button img')).map((v) => v.src).filter((el) => el !== avatar);

  return {
    avatar,
    gallery,
  };
};
