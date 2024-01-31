import React from 'react';

import {
  StyledDashboardOption,
  StyledDashboardSelect,
  StyledDashboardSelectContainer,
} from './DasboardSelect.styled';

type optionsType = {
    value: string
    label: string
    selected?:boolean
}

interface DashboardSelectProps {
    onSelectChange: (value: string) => void
    options: optionsType[]
    initialValue?: string
}

export const DashboardSelect: React.FC<DashboardSelectProps> = ({
  onSelectChange,
  options,
  initialValue,
}) => {
  // @ts-ignore
  const handleSelectChange = (event) => {
    const selectedValue = event?.target?.value || '';
    onSelectChange(selectedValue);
  };

  return (
      <StyledDashboardSelectContainer>
          <StyledDashboardSelect onChange={handleSelectChange} >
              {options.map((el) => <StyledDashboardOption
                  label={el.label}
                  value={el.value}
                  selected={el.value === initialValue }
              />)}
          </StyledDashboardSelect>
      </StyledDashboardSelectContainer>
  );
};
