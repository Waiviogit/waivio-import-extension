import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { MODAL_STYLES } from '../constants/styles';

interface DraggableModalProps {
    title: string;
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    footerComponents?: React.ReactNode;
    children: React.ReactNode;
    okText?: string;
    cancelText?: string;
    width?: number;
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
}) => {
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0, top: 0, bottom: 0, right: 0,
  });
  const draggleRef = useRef<HTMLDivElement>(null);

  const onStart = (_event: any, uiData: any) => {
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

  return (
      <Draggable
          disabled={disabled}
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
      >
          <div
              ref={draggleRef}
              style={{
                display: open ? 'block' : 'none',
                width: `${width}px`,
                position: 'fixed',
                backgroundColor: 'white',
                borderRadius: '8px',
                top: '10%',
                left: '30%',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,.15)',
              }}
          >
              <div
                  style={MODAL_STYLES.header}
                  onMouseOver={() => setDisabled(false)}
                  onMouseOut={() => setDisabled(true)}
              >
                  <div style={MODAL_STYLES.title}>{title}</div>
                  <div style={MODAL_STYLES.close} onClick={onCancel}><CloseOutlined /></div>
              </div>
              <div style={MODAL_STYLES.body}>{children}</div>
              <div style={MODAL_STYLES.footer}>
                  {footerComponents}
                  <Button onClick={onCancel}>{cancelText}</Button>
                  <Button style={{ marginRight: '10px' }} type={'primary'} onClick={onOk}>{okText}</Button>
              </div>
          </div>
      </Draggable>);
};
