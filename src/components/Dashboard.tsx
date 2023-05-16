import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import { sendMessageToContentScript, PARSE_COMMANDS } from '../services/pageParser';

export const Dashboard = () => {
  const parseToJson = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_JSON);
  const parseToCsv = async (): Promise<void> => sendMessageToContentScript(PARSE_COMMANDS.TO_CSV);

  return (
        <StyledDashboard>
                <DashboardButton text={'get JSON'} onClick={parseToJson} />
                <DashboardButton text={'get XLSX'} onClick={parseToCsv}/>
        </StyledDashboard>
  );
};
