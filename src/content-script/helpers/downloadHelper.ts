import { formatToCsvObject, formatToJsonObject, parsedObjectType } from '../getProduct';

export const downloadObjectAsJson = (exportObj: parsedObjectType, exportName: string): void => {
  const jsonFormat = formatToJsonObject(exportObj);
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonFormat))}`;
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `${exportName}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const objectToCsv = (objArray: object[]): string => {
  const header = Object.keys(objArray[0]).join(',');
  const rows = objArray.map((obj) => Object.values(obj).join(','));
  return `${header}\n${rows.join('\n')}`;
};

export const downloadObjectAsCsv = (exportObj: parsedObjectType, exportName: string): void => {
  const object = formatToCsvObject(exportObj);

  const csv = objectToCsv([object]);
  const blob = new Blob([csv], { type: 'text/csv' });
  const csvUrl = window.webkitURL.createObjectURL(blob);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', csvUrl);
  downloadAnchorNode.setAttribute('download', `${exportName}.csv`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
