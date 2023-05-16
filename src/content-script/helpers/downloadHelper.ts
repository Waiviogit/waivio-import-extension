import * as XLSX from 'xlsx';
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

export const downloadXLSX = (exportObj: parsedObjectType, exportName: string): void => {
  const object = formatToCsvObject(exportObj);
  const worksheet = XLSX.utils.json_to_sheet([object]);

  // Create a new workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Convert workbook to binary XLSX data
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a Blob from the XLSX data
  const blob = new Blob([wbout], { type: 'application/octet-stream' });

  // Create a temporary URL to the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element and set its attributes
  const link = document.createElement('a');
  link.href = url;
  link.download = `${exportName}.xlsx`;

  // Append the link to the document body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Clean up the temporary URL and remove the link element
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
};
