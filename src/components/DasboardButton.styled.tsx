import styled, { keyframes } from 'styled-components';

export const StyledDashboardButtonContainer = styled.div`
  margin-bottom: 10px
`;

const rotateAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.6;
  }
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

  &:disabled {
    border: 1px solid #999999;
    background-color: #cccccc;
    color: #666666;
    position: relative;
    overflow: hidden;
    cursor: not-allowed;
  }

  &:disabled::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #fff;
    animation: ${rotateAnimation} 1s linear infinite;
  }

  &:disabled::before {
    content: 'Loading...';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    text-align: center;
    text-transform: uppercase;
    line-height: 16px;
    animation: ${pulseAnimation} 1s linear infinite;
  }
`;
