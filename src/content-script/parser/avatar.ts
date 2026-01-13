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

type CandidateType = {
  img: HTMLImageElement;
  src: string;
  r: DOMRect;
  score: number;
  w: number;
  h: number;
};

function pickAvatarInsta() {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('header img, img'));
  const scored = imgs.map((img) => {
    const r = img.getBoundingClientRect();
    const w = r.width; const
      h = r.height;
    const squareScore = 1 - Math.min(1, Math.abs(w - h) / Math.max(w, h, 1));
    const sizeScore = Math.min(1, Math.max(w, h) / 200); // чем крупнее, тем лучше
    const topScore = 1 - Math.min(1, r.top / 600); // чем выше, тем лучше
    const alt = (img.getAttribute('alt') || '').toLowerCase();
    const altScore = alt.includes('profile') ? 1 : 0;
    const headerScore = img.closest('header') ? 1 : 0;

    const score = squareScore * 0.35 + sizeScore * 0.25 + topScore * 0.25
      + altScore * 0.1 + headerScore * 0.05;
    return { img, score, r };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.img || null;
}

function pickGalleryInsta({ limit = 6, minSize = 90 } = {}): string[] {
  const avatar = pickAvatarInsta();
  const avatarSrc = avatar?.currentSrc || avatar?.src || null;

  const imgs = Array.from(document.querySelectorAll('img'))
    .filter((img) => img.currentSrc || img.src);

  // базовые кандидаты
  const candidates = imgs
    .map((img): CandidateType | null => {
      const r = img.getBoundingClientRect();
      const src = img.currentSrc || img.src;

      if (r.width < minSize || r.height < minSize) return null;
      if (r.bottom < 0 || r.top > window.innerHeight * 3) {
        // return null;
      }

      if (avatar && (img === avatar || src === avatarSrc || avatar.contains?.(img))) return null;

      const w = r.width; const
        h = r.height;
      const squareScore = 1 - Math.min(1, Math.abs(w - h) / Math.max(w, h, 1));
      const sizeScore = Math.min(1, Math.max(w, h) / 400); // превью обычно 120-300+
      const belowHeaderScore = (() => {
        const header = document.querySelector('header');
        if (!header) return 0.5;
        const hr = header.getBoundingClientRect();
        if (r.top >= hr.bottom) return Math.min(1, (r.top - hr.bottom) / 600 + 0.2);
        return 0;
      })();

      const inMainScore = img.closest('main') ? 1 : 0.3;
      const clickableScore = img.closest('a') ? 1 : 0;
      const nearCenterScore = (() => {
        const cx = r.left + r.width / 2;
        const dist = Math.abs(cx - window.innerWidth / 2);
        return 1 - Math.min(1, dist / (window.innerWidth / 2));
      })();

      const srcHintScore = /cdninstagram|fbcdn|instagram/.test(src) ? 1 : 0.4;

      const score = squareScore * 0.28
            + sizeScore * 0.18
            + belowHeaderScore * 0.22
            + clickableScore * 0.12
            + inMainScore * 0.10
            + nearCenterScore * 0.06
            + srcHintScore * 0.04;

      return {
        img, src, r, score, w: Math.round(w), h: Math.round(h),
      };
    })
    .filter((c): c is CandidateType => c !== null);

  if (!candidates.length) return [];

  const sizeBuckets = new Map<string, number>();
  for (const c of candidates) {
    const key = `${Math.round(c.r.width / 10) * 10}x${Math.round(c.r.height / 10) * 10}`;
    sizeBuckets.set(key, (sizeBuckets.get(key) || 0) + 1);
  }

  for (const c of candidates) {
    const key = `${Math.round(c.r.width / 10) * 10}x${Math.round(c.r.height / 10) * 10}`;
    const sameSizeCount = sizeBuckets.get(key) || 0;
    const gridBonus = Math.min(1, sameSizeCount / 6);
    c.score += gridBonus * 0.25;
  }

  candidates.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const picked: CandidateType[] = [];
  for (const c of candidates) {
    const key = (c.src || '').split('?')[0]; // грубый дедуп
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(c);
    if (picked.length >= limit) break;
  }

  return picked.map((p) => p.src || '');
}

export const getAvatarInstagram = () : AvatarGalleryType => {
  const avatar = pickAvatarInsta()?.src || '';

  return {
    avatar,
    gallery: pickGalleryInsta(),
  };
};
