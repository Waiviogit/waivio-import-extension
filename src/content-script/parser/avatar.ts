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

type GalleryCandidateType = {
  img: HTMLImageElement;
  src: string;
  r: DOMRect;
  key: string;
  qw: number;
  qh: number;
  score: number;
};

type BucketType = {
  items: GalleryCandidateType[];
  key: string;
  qw: number;
  qh: number;
  bucketScore?: number;
  count?: number;
  maxSide?: number;
  clickableRatio?: number;
  belowHeaderRatio?: number;
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

function pickGalleryInsta({
  limit = 6,
  minSize = 80,
  quant = 8,
  preferBelowHeader = true,
} = {}): string[] {
  const avatar = pickAvatarInsta();
  const avatarSrc = avatar?.currentSrc || avatar?.src || null;

  const header = document.querySelector('header');
  const headerBottom = header ? header.getBoundingClientRect().bottom : 0;

  const imgs = Array.from(document.querySelectorAll('img'))
    .filter((img) => img.currentSrc || img.src);

  const candidates = imgs
    .map((img): GalleryCandidateType | null => {
      const r = img.getBoundingClientRect();
      const src = img.currentSrc || img.src;

      if (r.width < minSize || r.height < minSize) return null;

      // отсекаем аватар
      if (avatar && (img === avatar || src === avatarSrc)) return null;

      const w = r.width;
      const h = r.height;

      // ключ bucket-а (квантизация)
      const qw = Math.round(w / quant) * quant;
      const qh = Math.round(h / quant) * quant;
      const key = `${qw}x${qh}`;

      const squareScore = 1 - Math.min(1, Math.abs(w - h) / Math.max(w, h, 1));
      const sizeScore = Math.min(1, Math.max(w, h) / 500);

      const belowHeader = r.top >= headerBottom;
      let belowHeaderScore: number;
      if (preferBelowHeader) {
        belowHeaderScore = belowHeader ? 1 : 0;
      } else {
        belowHeaderScore = 0.5;
      }

      const clickableScore = img.closest('a') ? 1 : 0;
      const inMainScore = img.closest('main') ? 1 : 0.4;

      // локальный score (для сортировки внутри bucket)
      const score = sizeScore * 0.35
        + squareScore * 0.20
        + clickableScore * 0.20
        + belowHeaderScore * 0.15
        + inMainScore * 0.10;

      return {
        img,
        src,
        r,
        key,
        qw,
        qh,
        score,
      };
    })
    .filter((c): c is GalleryCandidateType => c !== null);

  if (!candidates.length) return [];

  // группируем по bucket
  const buckets = new Map<string, BucketType>();
  for (const c of candidates) {
    if (!buckets.has(c.key)) {
      buckets.set(c.key, {
        items: [],
        key: c.key,
        qw: c.qw,
        qh: c.qh,
      });
    }
    const bucket = buckets.get(c.key);
    if (bucket) {
      bucket.items.push(c);
    }
  }

  // выбираем лучший bucket
  // критерий: много элементов + не слишком мелкий + "похоже на карточки"
  // (часто кликабельны/ниже header)
  let best: BucketType | null = null;

  for (const b of buckets.values()) {
    const { items } = b;

    const count = items.length;
    const avgW = items.reduce((s, x) => s + x.r.width, 0) / count;
    const avgH = items.reduce((s, x) => s + x.r.height, 0) / count;
    const maxSide = Math.max(avgW, avgH);

    // доля кликабельных
    const clickableRatio = items.filter((x) => x.img.closest('a')).length / count;

    // доля "ниже header"
    const belowHeaderRatio = header
      ? items.filter((x) => x.r.top >= headerBottom).length / count
      : 0.7;

    // штрафуем совсем мелкие иконки (96x96 и т.п.)
    const smallPenalty = maxSide < 140 ? 0.35 : 1; // порог можно подкрутить

    // bucketScore: чем больше элементов и чем больше размер, тем лучше
    const bucketScore = (count * 1.0)
      * (Math.min(1.2, maxSide / 220))
      * (0.6 + clickableRatio * 0.4)
      * (preferBelowHeader ? (0.6 + belowHeaderRatio * 0.4) : 1)
      * smallPenalty;

    if (!best || bucketScore > (best.bucketScore || 0)) {
      best = {
        items: b.items,
        key: b.key,
        qw: b.qw,
        qh: b.qh,
        bucketScore,
        count,
        maxSide,
        clickableRatio,
        belowHeaderRatio,
      };
    }
  }

  if (!best) return [];

  // внутри лучшего bucket сортируем по индивидуальному score
  best.items.sort((a, b) => b.score - a.score);

  // дедуп по src
  const seen = new Set<string>();
  const picked: GalleryCandidateType[] = [];
  for (const c of best.items) {
    const key = (c.src || '').split('?')[0];
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
