import React from 'react';
import { StyledDashboardButton, StyledDashboardButtonContainer } from './DasboardButton.styled';

interface DashboardButtonProps {
    text: string
    onClick: () => void
}

export const DashboardButton : React.FC<DashboardButtonProps> = ({ text, onClick }) => (
        <StyledDashboardButtonContainer>
            <StyledDashboardButton onClick={onClick}>
                {text}
            </StyledDashboardButton>
        </StyledDashboardButtonContainer>
);
