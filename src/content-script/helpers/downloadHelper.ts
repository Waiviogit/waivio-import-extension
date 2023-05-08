import { formatToJsonObject, parsedObjectType } from '../getProduct';

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

export const downloadObjectAsCsv = (exportObj: parsedObjectType, exportName: string): void => {

};
