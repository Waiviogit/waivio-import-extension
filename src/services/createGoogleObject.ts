import axios from 'axios';
import { loadImageBase64 } from '../content-script/helpers/downloadWaivioHelper';
import { getStorageKey } from './chromeHelper';

type locationType = {
    latitude: number,
    longitude: number
}
interface placesRequestInterface {
    textQuery: string
    apiKey: string
    map?: locationType | null
}

interface placesRequestDetailsInterface {
    placeId: string
    apiKey: string
}

interface placesPhotoRequestInterface {
    photoReference: string
    apiKey: string
    maxwidth: number
}

type regularOpeningHoursType = {
    weekdayDescriptions: string[]
}

type textType = {
    text: string
}

type ReviewType = {
    text: {
        text: string
    }
}

type searchResultType = {
    id: string
    internationalPhoneNumber:string
    formattedAddress:string
    addressComponents: [{
        longText: string
        types: string[]
    }]
    location: locationType
    rating: number
    websiteUri: string
    regularOpeningHours: regularOpeningHoursType
    displayName: textType // {text: string}
    editorialSummary: textType // {text: string} //for description
    photos: string[] // {text: string} //for description
    reviews: ReviewType[]
}
type photosDetailsType = {
    photo_reference: string
    width: number
}

type searchResultDetailsType = {
    photos: photosDetailsType[]
}

type placesRequestType = {
    result: searchResultType[]
    error?: unknown
}

type placesRequestDetailsType = {
    result: searchResultDetailsType
    error?: unknown
}

type placesPhotoRequestType = {
    result?: Blob
    error?: unknown
}

export const placesRequest = async ({
  textQuery, apiKey, map,
}: placesRequestInterface): Promise<placesRequestType> => {
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery,
        languageCode: 'en',
        ...(map
            && {
              locationBias: {
                circle: {
                  center: map,
                  radius: 500.0,
                },
              },
            }),
      },
      {
        // search for locale
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          // pick fields
          'X-Goog-FieldMask': 'places.id,places.internationalPhoneNumber,places.formattedAddress,places.location,places.rating,places.websiteUri,places.regularOpeningHours,places.displayName,places.editorialSummary,places.photos,places.reviews',
        },
      },

    );

    return { result: response?.data?.places ?? [] };
  } catch (error) {
    return {
      error,
      result: [],
    };
  }
};

export const placesDetailsRequest = async (
  { placeId, apiKey }:placesRequestDetailsInterface,
): Promise<placesRequestDetailsType> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}&fields=photos`,
    );

    return { result: response?.data?.result };
  } catch (error) {
    return { error, result: { photos: [] } };
  }
};

export const placesPhotoRequest = async ({
  photoReference, apiKey, maxwidth,
}: placesPhotoRequestInterface): Promise<placesPhotoRequestType> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${apiKey}`,
    );

    const result = await response.blob();

    return { result };
  } catch (error) {
    return { error };
  }
};

interface getGooglePlaceInterface {
    name: string
    address: string
    map : {latitude: number, longitude: number} | null
}

export const getGooglePlace = async ({ name, address, map }: getGooglePlaceInterface) => {
  const textQuery = `${name} ${address}`;
  const apiKey = await getStorageKey();

  if (!apiKey) {
    return {
      error: { message: 'No API key provided' },
    };
  }

  let { result, error } = await placesRequest({ textQuery, apiKey });
  if (error) {
    return { error };
  }

  if (!result?.length) {
    ({ result, error } = await placesRequest({
      textQuery: name,
      apiKey,
      map,
    }));
    if (!result?.length || error) {
      return { error: { message: 'placesRequest Not Found' } };
    }
  }

  let business = result?.find((r) => r.photos && r.photos.length);
  if (!business) {
    // eslint-disable-next-line prefer-destructuring
    business = result[0];
  }

  const objectData = {
    name: business.displayName.text,
    address: business.formattedAddress,
    ...(business.editorialSummary && { descriptions: [business.editorialSummary.text] }),
    ...(business.location
        && { latitude: business.location.latitude, longitude: business.location.longitude }),
    ...(business.regularOpeningHours && { workingHours: business.regularOpeningHours.weekdayDescriptions.join(',\n') }),
    ...(business.websiteUri && { websites: [business.websiteUri] }),
    ...(business.internationalPhoneNumber && { phone: business.internationalPhoneNumber }),
    ...(business.rating && {
      features: [{
        key: 'Overall Rating',
        value: [business.rating],
      }],
    }),
    companyIds: [{ companyIdType: 'googleMaps', companyId: business.id }],
    primaryImageURLs: [] as string[],
    imageURLs: []as string[],
    ...(business.reviews?.length
        && { reviews: business.reviews.map((el) => el?.text?.text).filter((el) => !!el) }),
  };

  const { result: details, error: detailsError } = await placesDetailsRequest({
    placeId: business.id,
    apiKey,
  });
  if (detailsError) {
    return { result: objectData, error: detailsError };
  }

  const detailsPhotos = details?.photos ?? [];

  for (const photo of detailsPhotos) {
    if (objectData.imageURLs.length >= 5) break;
    const { result: photoString, error: photoError } = await placesPhotoRequest({
      photoReference: photo.photo_reference,
      maxwidth: photo.width,
      apiKey,
    });
    if (photoError || !photoString) {
      continue;
    }
    // upload to waivio
    const { result: waivioUploaded } = await loadImageBase64(photoString);
    if (!waivioUploaded) continue;
    // push to images array
    if (!objectData.primaryImageURLs.length) {
      objectData.primaryImageURLs.push(waivioUploaded);
      continue;
    }
    objectData.imageURLs.push(waivioUploaded);
  }

  return { result: objectData };
};
