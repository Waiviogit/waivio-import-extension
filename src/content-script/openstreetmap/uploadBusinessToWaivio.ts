import formBusinessObject from './formBusinessObject';
import { downloadToWaivio } from '../helpers/downloadWaivioHelper';

const uploadBusinessToWaivio = async (type?: string):Promise<void> => {
  const business = await formBusinessObject();
  if (!business) return;

  const objectType = type || 'business';

  await downloadToWaivio({
    object: business,
    objectType,
  });
};

export default uploadBusinessToWaivio;
