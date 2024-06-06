import { EXTENSION_COMMANDS } from '../../common/constants';
import { businessImportType } from '../openstreetmap/formBusinessObject';
import { SUPPORTED_OBJECT_TYPES } from '../../common/constants/components';

const getPlaceInfo = () => {
  const titles = Array.from(document.querySelectorAll<HTMLElement>('h1:not(.fontTitleLarge)'));
  const name = titles[titles.length - 1]?.innerText;

  const address = document.querySelector<HTMLElement>('button[data-item-id="address"]')?.innerText;

  return {
    name,
    address,
  };
};

const getLatLngFromGoogleMapsUrl = (url: string) => {
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  }
  return null;
};

export const getGoogleId = async () : Promise<string> => {
  const { name, address } = getPlaceInfo();

  const map = getLatLngFromGoogleMapsUrl(document.URL);

  const response = await chrome.runtime.sendMessage({
    action: EXTENSION_COMMANDS.GET_GOOGLE_OBJECT_ID, payload: { name, address, map },
  });

  return response;
};

interface checkOnTypesInterface {
  types: string[],
  objectType: string
}
type checkOnTypesType = {
  inputType: string,
  matchType: string,
  match: boolean,
}

const restaurantTypes = ['cafe', 'restaurant', 'food', 'pizza', 'sushi'];

const checkOnTypes = ({ objectType, types }: checkOnTypesInterface): checkOnTypesType => {
  const match = types.some((type) => restaurantTypes.some((rt) => type.includes(rt)));

  if (objectType === SUPPORTED_OBJECT_TYPES.RESTAURANT) {
    return match
      ? {
        inputType: objectType,
        matchType: objectType,
        match,
      }
      : {
        inputType: objectType,
        matchType: SUPPORTED_OBJECT_TYPES.BUSINESS,
        match,
      };
  }
  if (objectType === SUPPORTED_OBJECT_TYPES.BUSINESS) {
    return match
      ? {
        inputType: objectType,
        matchType: SUPPORTED_OBJECT_TYPES.RESTAURANT,
        match: false,
      }
      : {
        inputType: objectType,
        matchType: objectType,
        match: true,
      };
  }

  return {
    inputType: objectType,
    matchType: objectType,
    match: false,
  };
};

// eslint-disable-next-line max-len
export const formBusinessObjectFromGoogle = async (type?:string) : Promise<businessImportType|undefined> => {
  const { name, address } = getPlaceInfo();

  const map = getLatLngFromGoogleMapsUrl(document.URL);

  const response = await chrome.runtime.sendMessage({
    action: EXTENSION_COMMANDS.CREATE_GOOGLE_OBJECT, payload: { name, address, map },
  });
  if (response?.error) {
    alert(response?.error?.message);
  }
  if (!response.result) return;

  if (type && response?.rawData?.types) {
    const check = checkOnTypes({
      objectType: type,
      types: response?.rawData?.types ?? [],
    });
    if (!check.match) {
      const prompt = `The system recognizes this object as a ${check.matchType}, but its current type is set to ${check.inputType}. If you want to continue downloading, please click OK`;
      if (!window.confirm(prompt)) return;
    }
  }

  return response.result as businessImportType;
};
