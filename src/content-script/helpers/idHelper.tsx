import ReactDOM from 'react-dom/client';
import React from 'react';
import { SOURCE_TYPES } from '../../common/constants';
import { getGoogleId } from '../googleMaps/formBusinessObjectFromGoogle';
import CopyContentModal, { fieldToCopyType } from '../components/copyContentModal';
import { getObjectLinkOnWaivio } from '../validation';
import AlertObjectModal from '../components/AlertObjectModal';
import { MODAL_IDS } from '../constants';

const renderModal = (fields: fieldToCopyType[]) => {
  const rootElement = document.createElement('div');
  rootElement.id = MODAL_IDS.MAIN_MODAL_HOST;
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(
      // @ts-ignore
      <CopyContentModal fields={fields} modalTitle={''}>
      </CopyContentModal>,
  );
};

export const getOSMId = (): undefined| string => {
  const downloadButtonLink = document.querySelector<HTMLLinkElement>('.secondary-actions a')?.href;
  if (!downloadButtonLink) {
    alert('downloadButtonLink not found');
    return;
  }

  let idMatch = downloadButtonLink.match(/node\/(\d+)/);
  if (!idMatch) idMatch = downloadButtonLink.match(/way\/(\d+)/);
  if (!idMatch) {
    return '';
  }

  const id = idMatch[1];

  return id;
};

export const getId = async (source: string):Promise<void> => {
  if (SOURCE_TYPES.GOOGLE_MAP === source) {
    const id = await getGoogleId();
    if (!id) {
      alert('Id not found');
      return;
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
    const id = getOSMId();
    if (!id) {
      alert('Id not found');
      return;
    }
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

const renderModalObject = (link:string) => {
  const rootElement = document.createElement('div');
  rootElement.id = MODAL_IDS.OBJECT_MODAL_HOST;
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(
      // @ts-ignore
      <AlertObjectModal url={link}>
      </AlertObjectModal>,
  );
};
export const checkWaivioObjects = async (url:string):Promise<void> => {
  const link = await getObjectLinkOnWaivio(url);

  if (link) renderModalObject(link);
};
