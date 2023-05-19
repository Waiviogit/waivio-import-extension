import * as XLSX from 'xlsx';
import {
  formatToCsvObject, formatToJsonObject, parsedObjectType,
} from '../getProduct';
import {
  getAsinsFromPage,
} from './scanAsinHelper';

const stingToClipboard = (text: string) :void => {
  const tempInput = document.createElement('textarea');
  tempInput.setAttribute('readonly', '');
  tempInput.value = text;
  document.body.appendChild(tempInput);

  tempInput.select();
  document.execCommand('copy');

  document.body.removeChild(tempInput);
};

const regularFileDownload = (uriComponent : string, fileName: string, format: string) => {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(uriComponent)}`;
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `${fileName}.${format}`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const downloadObjectAsJson = (exportObj: parsedObjectType, exportName: string): void => {
  const jsonFormat = formatToJsonObject(exportObj);

  regularFileDownload(
    JSON.stringify(jsonFormat),
    exportName,
    'json',
  );
};

export const copyToClipboard = (exportObj: parsedObjectType, exportName: string): void => {
  const object = formatToCsvObject(exportObj);

  const tabRow = Object.values(object).join('\t');
  stingToClipboard(tabRow);

  alert('product copied to clipboard');
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

  const tabRow = Object.values(object).join('\t');
  stingToClipboard(tabRow);
};

export const downloadASIN = async (exportName: string): Promise<void> => {
  const asins = await getAsinsFromPage();

  stingToClipboard(asins);
  regularFileDownload(
    asins,
    exportName,
    'txt',
  );
};
