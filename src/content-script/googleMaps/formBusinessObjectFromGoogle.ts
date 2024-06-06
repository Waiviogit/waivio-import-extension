import { EXTENSION_COMMANDS } from '../../common/constants';
import { businessImportType } from '../openstreetmap/formBusinessObject';

const getPlaceInfo = () => {
  const name = document.querySelector<HTMLElement>('h1:not(.fontTitleLarge)')?.innerText;
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

export const formBusinessObjectFromGoogle = async () : Promise<businessImportType|undefined> => {
  const { name, address } = getPlaceInfo();

  const map = getLatLngFromGoogleMapsUrl(document.URL);

  const response = await chrome.runtime.sendMessage({
    action: EXTENSION_COMMANDS.CREATE_GOOGLE_OBJECT, payload: { name, address, map },
  });
  if (response?.error) {
    alert(response?.error?.message);
  }
  if (!response.result) return;

  return response.result as businessImportType;
};
