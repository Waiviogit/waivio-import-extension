import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import { sendMessageToContentScript, PARSE_COMMANDS } from '../services/pageParser';

export const Dashboard = () => {
  const parseToJson = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_JSON);
  const parseToXLSX = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_CSV);
  const copyToClipboard = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_CLIPBOARD);

  return (
        <StyledDashboard>
                <DashboardButton text={'get JSON'} onClick={parseToJson} />
                <DashboardButton text={'get XLSX'} onClick={parseToXLSX}/>
                <DashboardButton text={'copy to clipboard'} onClick={copyToClipboard}/>
        </StyledDashboard>
  );
};
