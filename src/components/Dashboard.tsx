import React, { useEffect, useState } from 'react';
import { StyledDashboard } from './Dashboard.styled';
import { DashboardButton } from './DasboardButton';
import manifest from '../../extension/manifest.json';
import {
  aliexpressButtonsConfig,
  instagramButtonConfig,
  mainButtonsConfig,
  sephoraButtonsConfig,
  tikTokConfig,
  walmartButtonsConfig,
  youtubeButtonConfig,
  instacartButtonsConfig,
} from '../common/helper';
import { getCurrentTab } from '../services/chromeHelper';
import { DashboardSelect } from './DashboardSelect';
import { SELECT_MAP_VALUES } from '../common/constants/components';
import { BUTTON_TEXT, PARSE_COMMANDS, SOURCE_TYPES } from '../common/constants';
import { sendMessageToContentScript, sendMessageToContentScriptNoEvent } from '../services/pageParser';
import { generateUniqueId } from '../common/helper/commonHelper';
import { DashboardInputKey } from './DashboardInputKey';
import { isValidGoogleMapsUrl } from '../common/helper/googleHelper';

const validUrlRegEx = /^(?!http:\/\/localhost)(https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(\/.*)?$/;

export const Dashboard = () => {
  const [currentUrl, setUrl] = useState('');
  const [timeoutId, setIntervalId] = useState<NodeJS.Timer | undefined>(undefined);
  const [selectedValue, setSelectedValue] = useState('business');
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectChange = (value:string) => {
    setSelectedValue(value);
    chrome.storage.local.set({ waivioObjectType: value });
  };

  useEffect(() => {
    async function getUrl() {
      try {
        const tab = await getCurrentTab();
        clearTimeout(timeoutId);

        if (!tab?.url) {
          setUrl('');
          setIsLoading(false);
          return;
        }

        if (tab.status !== 'complete') {
          setIsLoading(true);
          const id = setTimeout(getUrl, 100);
          setIntervalId(id);
        } else {
          setUrl(tab.url);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting current tab:', error);
        setUrl('');
        setIsLoading(false);
      }
    }

    chrome.storage.local.get('waivioObjectType', (el) => {
      setSelectedValue(el?.waivioObjectType ?? 'business');
    });
    getUrl();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const renderButton = () => {
    if (isLoading) {
      return <h2>Loading...</h2>;
    }

    if (!currentUrl) {
      return <h2>No URL detected</h2>;
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
    }
    if (currentUrl.includes('instagram.com')) {
      return (
        instagramButtonConfig
          .map((button) => <DashboardButton
                    text={button.text}
                    onClick={button.onClick}
                    id={button.id}
                    key={button.id}
                />)
      );
    }
    if (currentUrl.includes('tiktok')) {
      return (
        tikTokConfig
          .map((button) => <DashboardButton
                  text={button.text}
                  onClick={button.onClick}
                  id={button.id}
                  key={button.id}
              />)
      );
    }
    if (currentUrl.includes('amazon')) {
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
    if (currentUrl.includes('instacart')) {
      return (
        instacartButtonsConfig
          .map((button) => <DashboardButton
                  text={button.text}
                  onClick={button.onClick}
                  id={button.id}
                  key={button.id}
              />)
      );
    }
    if (currentUrl.includes('aliexpress')) {
      return (
        aliexpressButtonsConfig
          .map((button) => <DashboardButton
                  text={button.text}
                  onClick={button.onClick}
                  id={button.id}
                  key={button.id}
              />)
      );
    }
    if (currentUrl.includes('sephora.com')) {
      return sephoraButtonsConfig
        .map((button) => <DashboardButton
              text={button.text}
              onClick={button.onClick}
              id={button.id}
              key={button.id}
          />);
    }
    if (currentUrl.includes('walmart.com')) {
      return walmartButtonsConfig
        .map((button) => <DashboardButton
                  text={button.text}
                  onClick={button.onClick}
                  id={button.id}
                  key={button.id}
              />);
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

      const getId = <DashboardButton
          text={BUTTON_TEXT.GET_OSM_ID}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.GET_ID,
              SOURCE_TYPES.OPENSTREETMAP,
            ))}
          id={generateUniqueId()}
      />;

      const createObjectLinkAllButton = <DashboardButton
          text={BUTTON_TEXT.CREATE_LINK_ALL}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.CREATE_LINK,
              SOURCE_TYPES.LINK_ALL,
            ))}
          id={generateUniqueId()}
      />;

      return [
        select,
        uploadWaivio,
        parseJson,
        getId,

        createObjectLinkAllButton,
      ];
    }
    if (isValidGoogleMapsUrl(currentUrl)) {
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
          Where to find your API key
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

      const getId = <DashboardButton
          text={BUTTON_TEXT.GET_GOOGLE_ID}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.GET_ID,
              SOURCE_TYPES.GOOGLE_MAP,
            ))}
          id={generateUniqueId()}
      />;

      const divider = <div style={{ height: '20px' }}></div>;
      const createObjectLinkAllButton = <DashboardButton
          text={BUTTON_TEXT.CREATE_LINK_ALL}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.CREATE_LINK,
              SOURCE_TYPES.LINK_ALL,
            ))}
          id={generateUniqueId()}
      />;

      return [
        instruction,
        input,
        divider,
        select,
        uploadWaivio,
        parseJson,
        getId,
        createObjectLinkAllButton,
      ];
    }

    if (validUrlRegEx.test(currentUrl)) {
      const editWithAi = <DashboardButton
          text={BUTTON_TEXT.EDIT_WITH_AI}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.EDIT_WITH_AI,
            ))}
          id={generateUniqueId()}
      />;
      const createObjectLinkAllButton = <DashboardButton
          text={BUTTON_TEXT.CREATE_LINK_ALL}
          onClick={async (event:Event): Promise<void> => (
            sendMessageToContentScript(
              event,
              PARSE_COMMANDS.CREATE_LINK,
              SOURCE_TYPES.LINK_ALL,
            ))}
          id={generateUniqueId()}
      />;

      return [createObjectLinkAllButton, editWithAi];
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
