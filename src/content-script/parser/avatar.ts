import { replaceInvisible } from '../helpers/commonHelper';

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
