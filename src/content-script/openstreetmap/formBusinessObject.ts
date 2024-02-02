import axios from 'axios';
import MD5 from '../helpers/md5Helper';

type openstreetmapTagType = {
  name: string
 'addr:postcode'?: string
  'addr:country'?: string
 'addr:street'?: string
 'addr:housenumber'?: string
 'addr:unit'?: string
 'addr:city'?: string
 'addr:province'?: string
  opening_hours?: string
  website?: string
  'contact:facebook'?: string
  'contact:x'?: string
  'contact:twitter'?: string
  'contact:youtube'?: string
  'contact:instagram'?: string
  'contact:github'?: string
  'contact:phone'?: string
  'contact:website'?: string
   phone?: string
  'brand:wikidata'?: string
}

type openstreetmapElementType = {
    lat?: number
    lon?: number
    tags: openstreetmapTagType
}

type fieldsFromWikidataType = {
  primaryImageURLs?: string[]
  imageURLs?: string[]
  latitude?: number
  longitude?: number
}

type companyIdType = {
  companyIdType: string
  companyId: string
}

type linkFieldsType = {
  linkFacebook?: string,
  linkTwitter?: string
  linkYouTube?: string
  linkInstagram?: string
  linkGitHub?: string
};

type businessImportType = fieldsFromWikidataType & {
  name: string
  address: string
  city?: string
  province?: string
  postalCode?: string
  workingHours?: string
  websites?: string[]
  socialLinks?: linkFieldsType
  companyIds: companyIdType[]
}
type linkObjectType = {
  datavalue?: {
    value?: string
  }
}

const getLinkToImage = (object: linkObjectType| undefined) => {
  const imageName = (object?.datavalue?.value ?? '').replace(/\s/g, '_');
  if (!imageName) return;

  const hash = MD5(imageName);
  const link = `https://upload.wikimedia.org/wikipedia/commons/${hash.slice(0, 1)}/${hash.slice(0, 2)}/${imageName}`;
  return link;
};

const getFieldsFromWikidata = async (id: string):Promise<fieldsFromWikidataType|null> => {
  try {
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${id}.json`;

    const response = {} as fieldsFromWikidataType;
    const wikidata = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip,deflate',
      },
    });

    const entity = wikidata?.data?.entities[id];

    const avatarObj = entity?.claims?.P154?.[0]?.mainsnak;

    const avatar = getLinkToImage(avatarObj);
    if (avatar) response.primaryImageURLs = [avatar];

    const imageObjects = entity?.claims?.P18 ?? [];
    response.imageURLs = [];

    for (const imageObject of imageObjects) {
      const image = getLinkToImage(imageObject?.mainsnak);
      if (image) response.imageURLs.push(image);
    }

    const mapData = entity?.claims?.P625;
    if (mapData && Array.isArray(mapData)) {
      const firstCordinates = mapData?.[0]?.mainsnak?.datavalue?.value;
      if (firstCordinates) {
        const latitude = firstCordinates?.latitude;
        const longitude = firstCordinates?.longitude;
        if (longitude && latitude) {
          response.latitude = latitude;
          response.longitude = longitude;
        }
      }
    }

    return response;
  } catch (error) {
    return null;
  }
};

const getDataFromOpenStreet = async (url: string):Promise<openstreetmapElementType | undefined> => {
  try {
    const xmlData = await axios.get(url);

    const element = xmlData?.data?.elements[0];
    return element;
  } catch (error) {

  }
};

const formBusinessObject = async (): Promise<businessImportType|undefined> => {
  const downloadButtonLink = document.querySelector<HTMLLinkElement>('.secondary-actions a')?.href;
  if (!downloadButtonLink) {
    alert('downloadButtonLink not found');
    return;
  }

  let idMatch = downloadButtonLink.match(/node\/(\d+)/);
  if (!idMatch) idMatch = downloadButtonLink.match(/way\/(\d+)/);
  if (!idMatch) {
    alert('id not found');
    return;
  }

  const id = idMatch[1];

  const element = await getDataFromOpenStreet(downloadButtonLink);
  if (!element) {
    alert('error parsing element data');
    return;
  }
  const { tags } = element;

  const address = `${tags['addr:unit'] ? `${tags['addr:unit']}-` : ''}${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}`.trim();

  const socialLinks = {
    ...(tags['contact:facebook'] && { linkFacebook: tags['contact:facebook'] }),
    ...(tags['contact:x'] && { linkTwitter: tags['contact:x'] }),
    ...(tags['contact:twitter'] && { linkTwitter: tags['contact:twitter'] }),
    ...(tags['contact:youtube'] && { linkYouTube: tags['contact:youtube'] }),
    ...(tags['contact:instagram'] && { linkInstagram: tags['contact:instagram'] }),
    ...(tags['contact:github'] && { linkGitHub: tags['contact:github'] }),
  };

  const objectData = {
    name: tags?.name,
    address,
    ...(tags['addr:city'] && { city: tags['addr:city'] }),
    ...(tags['addr:province'] && { province: tags['addr:province'] }),
    ...(tags['addr:postcode'] && { postalCode: tags['addr:postcode'] }),
    ...(tags['addr:country'] && { country: tags['addr:country'] }),
    ...(element.lat && element.lon && { latitude: element.lat, longitude: element.lon }),
    ...(tags.opening_hours && { workingHours: tags.opening_hours }),
    ...(tags.website && { websites: [tags.website] }),
    ...(tags['contact:website'] && { websites: [tags['contact:website']] }),
    ...(Object.keys(socialLinks).length !== 0 && { socialLinks }),
    ...(tags['contact:phone'] && { phone: tags['contact:phone'] }),
    ...(tags.phone && { phone: tags.phone }),
    companyIds: [{ companyIdType: 'openstrmaps', companyId: id }],
  } as businessImportType;

  if (tags['brand:wikidata']) {
    const wikidata = await getFieldsFromWikidata(tags['brand:wikidata']);
    if (wikidata) {
      objectData.companyIds.push({ companyIdType: 'wikidata', companyId: tags['brand:wikidata'] });
      Object.assign(objectData, wikidata);
    }
  }
  return objectData;
};

export default formBusinessObject;
