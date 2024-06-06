import ReactDOM from 'react-dom/client';
import React from 'react';
import { SOURCE_TYPES } from '../../common/constants';
import { getGoogleId } from '../googleMaps/formBusinessObjectFromGoogle';
import CopyContentModal from '../components/copyContentModal';

export const getId = async (source: string):Promise<void> => {
  if (SOURCE_TYPES.GOOGLE_MAP === source) {
    const id = await getGoogleId();
    if (!id) {
      alert('Id not found');
    }
    const rootElement = document.createElement('div');
    rootElement.id = 'react-chrome-modal';
    document.body.appendChild(rootElement);
    const rootModal = ReactDOM.createRoot(rootElement);

    const fields = [
      {
        title: 'Company ID type:',
        textToCopy: 'googleMaps',
        buttonName: 'copy',
      },
      {
        title: 'Company ID:',
        textToCopy: id,
        buttonName: 'copy',
      },
    ];

    rootModal.render(
        // @ts-ignore
        <CopyContentModal fields={fields} modalTitle={''}>
            </CopyContentModal>,
    );
  }
};
