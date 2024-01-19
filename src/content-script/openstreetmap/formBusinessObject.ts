import axios from 'axios';
import { parse } from 'node-html-parser';

type openstreetmapTagType = {
  name: string
 'addr:postcode'?: string
 'addr:street'?: string
 'addr:housenumber'?: string
 'addr:city'?: string
  opening_hours?: string
  website?: string
  'contact:facebook'?: string
  'contact:phone'?: string
  'brand:wikidata'?: string
}

type openstreetmapElementType = {
    lat?: number
    lon?: number
    tags: openstreetmapTagType
}

type mapType = {
  latitude: number
  longitude: number
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

type businessImportType = fieldsFromWikidataType & {
  name: string
  address: string
  workingHours?: string
  websites?: string[]
  companyIds: companyIdType[]
}

const replaceThumbnailUrl = (originalUrl: string): string => {
  // Define the pattern to match the "/thumb/" and "/<size>px-" portions of the URL
  const pattern = /thumb\/|\/\d+px.+/g;

  // Use the replace method to replace the matched pattern with an empty string
  const replacedUrl = originalUrl.replace(pattern, '');

  return replacedUrl;
};

const convertStringToCoordinates = (inputString: string): null| mapType => {
  // Replace HTML-encoded entities with the corresponding characters
  const decodedString = inputString
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"');

  // Regular expression to extract degrees, minutes, seconds, and direction
  const regex = /(\d+)°(\d+)'([\d.]+)"([NSWE]),\s*(\d+)°(\d+)'([\d.]+)"([NSWE])/;

  // Match the input string with the regular expression
  const match = decodedString.match(regex);

  if (!match) {
    // If the input string doesn't match the expected format, return null
    return null;
  }

  // Extract values from the regex match
  const latDegrees = parseFloat(match[1]);
  const latMinutes = parseFloat(match[2]);
  const latSeconds = parseFloat(match[3]);
  const latDirection = match[4];

  const lonDegrees = parseFloat(match[5]);
  const lonMinutes = parseFloat(match[6]);
  const lonSeconds = parseFloat(match[7]);
  const lonDirection = match[8];

  // Convert degrees, minutes, and seconds to decimal degrees
  const latitude = (latDirection === 'S' ? -1 : 1) * (latDegrees + latMinutes / 60 + latSeconds / 3600);
  const longitude = (lonDirection === 'W' ? -1 : 1) * (lonDegrees + lonMinutes / 60 + lonSeconds / 3600);

  // Return an object with lat and lon properties
  return { latitude, longitude };
};

const getFieldsFromWikidata = async (id: string):Promise<fieldsFromWikidataType|null> => {
  try {
    const wikidata = await axios.get(`https://www.wikidata.org/wiki/${id}`);
    const document = parse(wikidata.data);

    const response = {} as fieldsFromWikidataType;
    const avatar = document.querySelector('#P154 img');
    if (avatar) response.primaryImageURLs = [replaceThumbnailUrl(`https:${avatar.getAttribute('src')}`)];

    const images = document.querySelectorAll('#P18 img');
    if (images.length) {
      response.imageURLs = [];
      for (const image of images) {
        // replace thumb replace /220pxjpg
        response.imageURLs.push(replaceThumbnailUrl(`https:${image.getAttribute('src')}`));
      }
    }

    const coordinatesContainer = document.querySelector('#P625 .wikibase-kartographer-caption');

    if (coordinatesContainer) {
      // eslint-disable-next-line no-underscore-dangle
      // @ts-ignore
      const coordinatesText = coordinatesContainer?.childNodes[0]?._rawText;

      const convertedCoordinates = convertStringToCoordinates(coordinatesText);
      if (convertedCoordinates) {
        response.latitude = convertedCoordinates.latitude;
        response.longitude = convertedCoordinates.longitude;
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

  const address = `${tags['addr:postcode'] || ''} ${tags['addr:street'] || ''} ${tags['addr:housenumber'] || ''} ${tags['addr:city'] || ''}`.trim();

  const objectData = {
    //+
    name: tags?.name,
    //+
    address,
    //+
    ...(element.lat && element.lon && { latitude: element.lat, longitude: element.lon }),
    //+
    ...(tags.opening_hours && { workingHours: tags.opening_hours }),
    //+
    ...(tags.website && { websites: [tags.website] }),

    //-
    ...(tags['contact:facebook'] && { facebook: tags['contact:facebook'] }),
    ...(tags['contact:phone'] && { phone: tags['contact:phone'] }),

    companyIds: [{ companyIdType: 'openstrmaps', companyId: id }],
  } as businessImportType;

  if (tags['brand:wikidata']) {
    objectData.companyIds.push({ companyIdType: 'wikidata', companyId: tags['brand:wikidata'] });

    const wikidata = getFieldsFromWikidata(tags['brand:wikidata']);
    if (wikidata) {
      Object.assign(objectData, wikidata);
    }
  }
  return objectData;
};

export default formBusinessObject;
