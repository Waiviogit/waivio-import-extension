import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import { sendMessageToContentScript, PARSE_COMMANDS } from '../services/pageParser';

export const Dashboard = () => {
  const parseToJson = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_JSON);
  const parseToXLSX = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_CSV);
  const copyToClipboard = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_CLIPBOARD);
  const scanAsins = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.SCAN_ASINS);

  return (
        <StyledDashboard>
                <DashboardButton text={'Get JSON'} onClick={parseToJson} />
                <DashboardButton text={'Get XLSX'} onClick={parseToXLSX}/>
                <DashboardButton text={'Copy to clipboard'} onClick={copyToClipboard}/>
                <DashboardButton text={'Scan for ASINs'} onClick={scanAsins}/>
        </StyledDashboard>
  );
};
