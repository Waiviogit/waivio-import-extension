import React, { useState, useRef } from 'react';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
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
  okText = 'Import Object',
  cancelText = 'Cancel',
  width = 800,
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
        <Modal
            bodyStyle={MODAL_STYLES.body}
            title={
                <div
                    style={MODAL_STYLES.title}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                    onFocus={() => undefined}
                    onBlur={() => undefined}
                >
                    {title}
                </div>
            }
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText={okText}
            cancelText={cancelText}
            width={width}
            maskClosable={false}
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    onStart={(event, uiData) => onStart(event, uiData)}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    {footerComponents}
                    <CancelBtn />
                    <OkBtn />
                </>
            )}
        >
            {children}
        </Modal>
  );
};
