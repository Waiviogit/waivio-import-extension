import { useEffect, useState } from 'react';
import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import manifest from '../../extension/manifest.json';
import {
  mainButtonsConfig,
  sephoraButtonsConfig,
  walmartButtonsConfig,
  youtubeButtonConfig,
} from '../common/helper';
import { getCurrentTab } from '../services/chromeHelper';
import { DashboardSelect } from './DashboardSelect';
import { SELECT_MAP_VALUES } from '../common/constants/components';
import { BUTTON_TEXT, PARSE_COMMANDS, SOURCE_TYPES } from '../common/constants';
import { sendMessageToContentScript } from '../services/pageParser';
import { generateUniqueId } from '../common/helper/commonHelper';
import { DashboardInputKey } from './DashboardInputKey';

export const Dashboard = () => {
  const [currentUrl, setUrl] = useState('');
  const [timeoutId, setIntervalId] = useState<NodeJS.Timer | undefined>(undefined);
  const [selectedValue, setSelectedValue] = useState('business');

  const handleSelectChange = (value:string) => {
    setSelectedValue(value);
    chrome.storage.local.set({ waivioObjectType: value }, () => {});
  };

  useEffect(() => {
    async function getUrl() {
      const tab = await getCurrentTab();
      clearTimeout(timeoutId);

      if (tab?.status !== 'complete') {
        setUrl('loading');

        const id = setTimeout(getUrl, 100);
        setIntervalId(id);
      } else {
        const url = tab?.url ?? '';
        setUrl(url);
      }
    }
    // for select on businesses
    chrome.storage.local.get('waivioObjectType', (el) => {
      setSelectedValue(el?.waivioObjectType ?? 'business');
    });
    getUrl();
  }, []);

  const renderButton = () => {
    if (currentUrl === 'loading') {
      return (
          <h2>Loading...</h2>
      );
    }
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
    if (currentUrl.includes('sephora.com')) {
      return (sephoraButtonsConfig
        .map((button) => <DashboardButton
              text={button.text}
              onClick={button.onClick}
              id={button.id}
              key={button.id}
          />)
      );
    }
    if (currentUrl.includes('walmart.com')) {
      return (walmartButtonsConfig
        .map((button) => <DashboardButton
                  text={button.text}
                  onClick={button.onClick}
                  id={button.id}
                  key={button.id}
              />)
      );
    }

    if (currentUrl.includes('openstreetmap.org')) {
      const select = <DashboardSelect
          options={SELECT_MAP_VALUES}
          onSelectChange={handleSelectChange}
          initialValue={selectedValue}
      />;

      const uploadWaivio = <DashboardButton
          text={BUTTON_TEXT.UPLOAD_TO_WAIVIO}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP,
              selectedValue,
            ))}
          id={generateUniqueId()}
      />;

      const parseJson = <DashboardButton
          text={BUTTON_TEXT.CREATE_JSON}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.TO_JSON,
              SOURCE_TYPES.OPENSTREETMAP,
            ))}
          id={generateUniqueId()}
      />;

      return [select, uploadWaivio, parseJson];
    }
    if (currentUrl.includes('google.com/maps')) {
      const select = <DashboardSelect
          options={SELECT_MAP_VALUES}
          onSelectChange={handleSelectChange}
          initialValue={selectedValue}
      />;

      const input = <DashboardInputKey/>;

      const uploadWaivio = <DashboardButton
          text={BUTTON_TEXT.UPLOAD_TO_WAIVIO}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE,
              selectedValue,
            ))}
          id={generateUniqueId()}
      />;

      const instruction = <div style={{ marginBottom: '5px' }}>
        <a
            href="https://www.waivio.com/object/jiw-google-maps-integration-set-up-an-api-key/page"
            style={{ color: '#f87007' }}
            target="_blank"
        >
          (instruction)
        </a>
      </div>;

      const parseJson = <DashboardButton
          text={BUTTON_TEXT.CREATE_JSON}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.TO_JSON,
              SOURCE_TYPES.GOOGLE_MAP,
            ))}
          id={generateUniqueId()}
      />;

      const divider = <div style={{ height: '20px' }}></div>;

      return [instruction, input, divider, select, uploadWaivio, parseJson];
    }
    return (
                <h2>No actions available</h2>
    );
  };

  return (
        <StyledDashboard>
            {renderButton()}
            <span style={{
              marginBottom: '10px', color: '#99aab5', position: 'absolute', bottom: '0',
            }}>Version {manifest.version}</span>
        </StyledDashboard>
  );
};
