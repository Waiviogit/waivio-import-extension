import React, { useEffect, useState } from 'react';

export const DashboardInputKey = () => {
  const [isInputEnabled, setIsInputEnabled] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = () => {
    console.log(inputValue);
    setIsInputEnabled((prevEnabled) => !prevEnabled);
    console.log(inputValue);
    chrome.storage.local.set({ googleApiKey: 'sdfsdfsdf' }, () => {});

    // setInputValue('');
  };

  // @ts-ignore
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    chrome.storage.local.get('googleApiKey', (el) => {
      const enabled = !el?.googleApiKey;

      setIsInputEnabled(enabled);
    });
  }, []);

  return (
        <div>
            <input
                id={'sdfsdf'}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={!isInputEnabled}
            />
            <button onClick={handleButtonClick}>
                {isInputEnabled ? 'Save API key' : 'Change API key'}
            </button>
        </div>
  );
};
