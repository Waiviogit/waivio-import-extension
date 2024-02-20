import axios from 'axios';
import { loadImageBase64 } from '../content-script/helpers/downloadWaivioHelper';
import { getStorageKey } from './chromeHelper';

interface placesRequestInterface {
    textQuery: string
    apiKey: string
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

type locationType = {
    latitude: number,
    longitude: number
}

type regularOpeningHoursType = {
    weekdayDescriptions: string[]
}

type textType = {
    text: string
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
  textQuery, apiKey,
}: placesRequestInterface): Promise<placesRequestType> => {
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery,
        languageCode: 'en',
      },
      {
        // search for locale
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          // pick fields
          'X-Goog-FieldMask': '*',
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
    console.log(placeId);
    console.log(apiKey);
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`,
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

export const getGooglePlace = async (textQuery: string) => {
  const apiKey = await getStorageKey();

  if (!apiKey) {
    return {
      error: { message: 'No API key provided' },
    };
  }

  const { result, error } = await placesRequest({ textQuery, apiKey });
  if (error) {
    return { error };
  }
  if (!result?.length) {
    return { error: { message: 'placesRequest Not Found' } };
  }
  const [business] = result;

  const city = business.addressComponents
    .find((el) => el.types.every((t) => ['locality', 'political'].includes(t)));

  const country = business.addressComponents
    .find((el) => el.types.every((t) => ['country', 'political'].includes(t)));
  const province = business.addressComponents
    .find((el) => el.types
      .every((t) => ['administrative_area_level_1', 'political'].includes(t)));

  const postCode = business.addressComponents
    .find((el) => el.types.every((t) => ['postal_code'].includes(t)));

  const objectData = {
    name: business.displayName.text,
    address: business.formattedAddress,
    ...(business.editorialSummary && { descriptions: [business.editorialSummary.text] }),
    ...(city && { city: city.longText }),
    ...(province && { province: province.longText }),
    ...(postCode && { postalCode: postCode.longText }),
    ...(country && { country: country.longText }),
    ...(business.location
        && { latitude: business.location.latitude, longitude: business.location.longitude }),
    ...(business.regularOpeningHours && { workingHours: business.regularOpeningHours.weekdayDescriptions.join(',\n') }),
    ...(business.websiteUri && { websites: [business.websiteUri] }),
    ...(business.internationalPhoneNumber && { phone: business.internationalPhoneNumber }),
    companyIds: [{ companyIdType: 'googleMaps', companyId: business.id }],
    primaryImageURLs: [] as string[],
    imageURLs: []as string[],
  };

  const { result: details, error: detailsError } = await placesDetailsRequest({
    placeId: business.id,
    apiKey,
  });
  if (detailsError) {
    return { result: objectData, error: detailsError };
  }

  for (const photo of details.photos) {
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
