import { useEffect, useState } from 'react';
import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import manifest from '../../extension/manifest.json';
import { mainButtonsConfig, youtubeButtonConfig } from '../common/helper';
import { getCurrentTab } from '../services/chromeHelper';

export const Dashboard = () => {
  const [currentUrl, setUrl] = useState('');

  useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    async function getUrl() {
      const tab = await getCurrentTab();
      const url = tab?.url ?? '';
      setUrl(url);
    }

    getUrl();
  }, []);

  const renderButton = () => {
    if (currentUrl.includes('youtube')) {
      return (
        youtubeButtonConfig
          .map((button) => <DashboardButton
                    text={button.text}
                    onClick={button.onClick}
                    id={button.id}
                    key={button.id}
                />)
      );
    } if (currentUrl.includes('amazon')) {
      return (
        mainButtonsConfig
          .map((button) => <DashboardButton
                  text={button.text}
                  onClick={button.onClick}
                  id={button.id}
                  key={button.id}
              />)
      );
    }
    return (
                <h2>No actions available</h2>
    );
  };

  return (
        <StyledDashboard>
            {renderButton()}
            <span style={{ marginBottom: '10px', color: '#99aab5', position: 'absolute', bottom: '0' }}>Version {manifest.version}</span>
        </StyledDashboard>
  );
};
