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
                <DashboardButton text={'get JSON'} onClick={parseToJson} />
                <DashboardButton text={'get XLSX'} onClick={parseToXLSX}/>
                <DashboardButton text={'copy to clipboard'} onClick={copyToClipboard}/>
                <DashboardButton text={'scan asins'} onClick={scanAsins}/>
        </StyledDashboard>
  );
};
