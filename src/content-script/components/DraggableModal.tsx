import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'antd';
import { CloseOutlined, MinusOutlined } from '@ant-design/icons';
import { MODAL_STYLES, Z_INDEX } from '../constants/styles';

interface DraggableModalProps {
    title: string;
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    footerComponents?: React.ReactNode;
    headerComponents?: React.ReactNode;
    children: React.ReactNode;
    okText?: string;
    cancelText?: string;
    width?: number;
    okButtonProps?: any;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  title,
  open,
  onOk,
  onCancel,
  children,
  okText = 'Import',
  cancelText = 'Cancel',
  width = 500,
  footerComponents,
  headerComponents,
  okButtonProps,
}) => {
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0, top: 0, bottom: 0, right: 0,
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const draggleRef = useRef<HTMLDivElement>(null);

  const onStart = (_event: any, uiData: { x: number; y: number }) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getModalStyle = () => {
    if (isMinimized) {
      return {
        display: open ? 'block' : 'none',
        width: '200px',
        height: '55px',
        position: 'fixed' as const,
        backgroundColor: 'white',
        borderRadius: '8px',
        top: '1%',
        left: '30%',
        zIndex: Z_INDEX.MODAL,
        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        pointerEvents: 'auto' as const,
        overflow: 'hidden' as const,
      };
    }

    return {
      display: open ? 'block' : 'none',
      width: `${width}px`,
      position: 'fixed' as const,
      backgroundColor: 'white',
      borderRadius: '8px',
      top: '1%',
      left: '30%',
      zIndex: Z_INDEX.MODAL,
      boxShadow: '0 4px 12px rgba(0,0,0,.15)',
      pointerEvents: 'auto' as const,
    };
  };

  return (
      <Draggable
          disabled={disabled}
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
      >
          <div
              ref={draggleRef}
              onKeyDown={(e) => e.stopPropagation()}
              style={getModalStyle()}
          >
              <div
                  style={MODAL_STYLES.header}
                  onMouseOver={() => setDisabled(false)}
                  onMouseOut={() => setDisabled(true)}
              >
                  <div style={MODAL_STYLES.title}>{title}</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {!isMinimized && headerComponents}
                      <div
                          style={{ ...MODAL_STYLES.close, margin: '0' }}
                          onClick={handleMinimize}
                          title={isMinimized ? 'Restore' : 'Minimize'}
                      >
                          <MinusOutlined />
                      </div>
                      <div
                          style={{ ...MODAL_STYLES.close, margin: '20px 20px 20px 0' }}
                          onClick={onCancel}
                          title="Close"
                      >
                          <CloseOutlined />
                      </div>
                  </div>
              </div>
              {!isMinimized && (
                  <>
                      <div style={MODAL_STYLES.body}>
                          {children}
                      </div>
                      <div style={MODAL_STYLES.footer}>
                          {footerComponents}
                          <Button onClick={onCancel}>{cancelText}</Button>
                          <Button style={{ marginRight: '10px' }} type={'primary'} onClick={onOk} {...okButtonProps}>{okText}</Button>
                      </div>
                  </>
              )}
          </div>
      </Draggable>);
};
