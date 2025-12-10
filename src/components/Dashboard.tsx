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
  hiveConfig,
  editAiButtons,
} from '../common/helper';
import { getCurrentTab } from '../services/chromeHelper';
import { DashboardSelect } from './DashboardSelect';
import { SELECT_MAP_VALUES } from '../common/constants/components';
import { BUTTON_TEXT, PARSE_COMMANDS, SOURCE_TYPES } from '../common/constants';
import { sendMessageToContentScript } from '../services/pageParser';
import { activeSitesList, generateUniqueId, getActiveSites } from '../common/helper/commonHelper';
import { DashboardInputKey } from './DashboardInputKey';
import { isValidGoogleMapsUrl } from '../common/helper/googleHelper';

const validUrlRegEx = /^(?!http:\/\/localhost)(https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(\/.*)?$/;

type Route = {
  name: string;
  test: (url: string) => boolean;
  render: () => React.ReactNode | React.ReactNode[];
};

export const Dashboard = () => {
  const [currentUrl, setUrl] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [selectedValue, setSelectedValue] = useState('business');
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectChange = (value:string) => {
    setSelectedValue(value);
    chrome.storage.local.set({ waivioObjectType: value });
  };

  const testWaivio = (url: string) => {
    for (const site of activeSitesList) {
      if (url.includes(site)) return true;
    }
    return false;
  };

  useEffect(() => {
    async function getUrl() {
      try {
        await getActiveSites();
        const tab = await getCurrentTab();
        clearTimeout(timeoutId as NodeJS.Timeout);

        if (!tab?.url) {
          setUrl('');
          setIsLoading(false);
          return;
        }

        if (tab.status !== 'complete') {
          setIsLoading(true);
          const id = setTimeout(getUrl, 100);
          setTimeoutId(id);
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
        clearTimeout(timeoutId as NodeJS.Timeout);
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

    const routes: Route[] = [
      {
        name: 'youtube',
        test: (url) => url.includes('youtube'),
        render: () => youtubeButtonConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'instagram',
        test: (url) => url.includes('instagram.com'),
        render: () => instagramButtonConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'tiktok',
        test: (url) => url.includes('tiktok'),
        render: () => tikTokConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'hive',
        test: testWaivio,
        render: () => hiveConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'amazon',
        test: (url) => url.includes('amazon'),
        render: () => mainButtonsConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'instacart',
        test: (url) => url.includes('instacart'),
        render: () => instacartButtonsConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'aliexpress',
        test: (url) => url.includes('aliexpress'),
        render: () => aliexpressButtonsConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'sephora',
        test: (url) => url.includes('sephora.com'),
        render: () => sephoraButtonsConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'walmart',
        test: (url) => url.includes('walmart.com'),
        render: () => walmartButtonsConfig.map((button) => (
          <DashboardButton
            text={button.text}
            onClick={button.onClick}
            id={button.id}
            key={button.id}
          />
        )),
      },
      {
        name: 'openstreetmap',
        test: (url) => url.includes('openstreetmap.org'),
        render: () => {
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
        },
      },
      {
        name: 'google-maps',
        test: (url) => isValidGoogleMapsUrl(url),
        render: () => {
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
        },
      },
      {
        name: 'generic-valid-url',
        test: (url) => validUrlRegEx.test(url),
        render: () => {
          const editButtons = editAiButtons.map((el) => <DashboardButton
              text={el.text}
              onClick={el.onClick}
              id={el.id}
              key={el.id}
          />);

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

          return [createObjectLinkAllButton, ...editButtons];
        },
      },
    ];

    const matchedRoute = routes.find((route) => route.test(currentUrl));
    if (matchedRoute) return matchedRoute.render();

    return <h2>No actions available</h2>;
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
