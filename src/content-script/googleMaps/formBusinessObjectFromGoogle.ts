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

const formBusinessObjectFromGoogle = async () : Promise<businessImportType|undefined> => {
  const { name, address } = getPlaceInfo();

  const textQuery = `${name} ${address}`;

  const response = await chrome.runtime.sendMessage({
    action: EXTENSION_COMMANDS.CREATE_GOOGLE_OBJECT, payload: textQuery,
  });
  if (response?.error) {
    alert(response?.error?.message);
  }
  if (!response.result) return;

  return response.result as businessImportType;
};

export default formBusinessObjectFromGoogle;
