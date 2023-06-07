import styled from 'styled-components';

export const StyledDashboardButtonContainer = styled.div`
  margin-bottom: 10px
`;

export const StyledDashboardButton = styled.button`
  width: 130px;
  height: 40px;
  border-radius: 10px;
  color: white;
  border: none;
  background: #f87007;
  &:hover {
    background-color: #d35f06;
    cursor: pointer;
  }
  &:disabled{
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}
`;
