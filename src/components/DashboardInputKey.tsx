import React, { useEffect, useState } from 'react';
import { DashboardButton } from './DasboardButton';
import { generateUniqueId } from '../common/helper/commonHelper';
import { StyledDashboardInput } from './DashboardInput.styled';
import { StyledDashboardButtonContainer } from './DasboardButton.styled';

export const DashboardInputKey = () => {
  const [isInputEnabled, setIsInputEnabled] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = async (): Promise<void> => {
    if (inputValue && isInputEnabled) {
      await chrome.storage.local.set({ googleApiKey: inputValue });
      setIsInputEnabled((prevEnabled) => !prevEnabled);
      return;
    }
    if (!isInputEnabled) {
      await chrome.storage.local.set({ googleApiKey: '' });
      setInputValue('');
      setIsInputEnabled((prevEnabled) => !prevEnabled);
    }
  };

  // @ts-ignore
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    chrome.storage.local.get('googleApiKey', (el) => {
      const enabled = !el?.googleApiKey;
      console.log(el?.googleApiKey);

      setIsInputEnabled(enabled);
      setInputValue(el?.googleApiKey);
    });
  }, []);

  return (
        <div>
            <StyledDashboardButtonContainer>
                <StyledDashboardInput
                    id={generateUniqueId()}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={!isInputEnabled}
                />
            </StyledDashboardButtonContainer>

            <StyledDashboardButtonContainer>
                <DashboardButton
                    text={isInputEnabled ? 'Set API key' : 'Reset API key'}
                    id={generateUniqueId()}
                    onClick={handleButtonClick}
                />
            </StyledDashboardButtonContainer>

        </div>
  );
};
