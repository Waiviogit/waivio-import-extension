import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import manifest from '../../extension/manifest.json';
import { mainButtonsConfig } from '../common/helper';

export const Dashboard = () => (
        <StyledDashboard>
            {
                mainButtonsConfig
                  .map((button) => <DashboardButton
                      text={button.text}
                      onClick={button.onClick}
                      id={button.id}
                      key={button.id}
                  />)
            }
            <span style={{ marginBottom: '10px' }}>version {manifest.version}</span>
        </StyledDashboard>
);
