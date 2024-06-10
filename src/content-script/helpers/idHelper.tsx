import ReactDOM from 'react-dom/client';
import React from 'react';
import { SOURCE_TYPES } from '../../common/constants';
import { getGoogleId } from '../googleMaps/formBusinessObjectFromGoogle';
import CopyContentModal, { fieldToCopyType } from '../components/copyContentModal';

const renderModal = (fields: fieldToCopyType[]) => {
  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(
      // @ts-ignore
      <CopyContentModal fields={fields} modalTitle={''}>
      </CopyContentModal>,
  );
};

export const getId = async (source: string):Promise<void> => {
  if (SOURCE_TYPES.GOOGLE_MAP === source) {
    const id = await getGoogleId();
    if (!id) {
      alert('Id not found');
    }

    const fields = [
      {
        title: 'Company ID type:',
        textToCopy: 'googleMaps',
        buttonName: 'Copy',
      },
      {
        title: 'Company ID:',
        textToCopy: id,
        buttonName: 'Copy',
      },
    ];
    renderModal(fields);
  }

  if (SOURCE_TYPES.OPENSTREETMAP === source) {
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
    const fields = [
      {
        title: 'Company ID type:',
        textToCopy: 'openstrmaps',
        buttonName: 'Copy',
      },
      {
        title: 'Company ID:',
        textToCopy: id,
        buttonName: 'Copy',
      },
    ];

    renderModal(fields);
  }
};
