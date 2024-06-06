import { downloadToWaivio } from '../helpers/downloadWaivioHelper';

import { formBusinessObjectFromGoogle } from './formBusinessObjectFromGoogle';

const uploadGooglePlaceToWaivio = async (type?: string):Promise<void> => {
  const business = await formBusinessObjectFromGoogle();
  if (!business) return;

  const objectType = type || 'business';

  await downloadToWaivio({
    object: business,
    objectType,
  });
};

export default uploadGooglePlaceToWaivio;
