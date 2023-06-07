import React from 'react';
import { StyledDashboardButton, StyledDashboardButtonContainer } from './DasboardButton.styled';

interface DashboardButtonProps {
    text: string
    id: string
    onClick: (event: any) => Promise<void>
}

export const DashboardButton : React.FC<DashboardButtonProps> = ({ text, onClick, id }) => (
        <StyledDashboardButtonContainer>
            <StyledDashboardButton onClick={onClick} id={id}>
                {text}
            </StyledDashboardButton>
        </StyledDashboardButtonContainer>
);
