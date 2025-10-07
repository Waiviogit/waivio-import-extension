import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Flex, Input, Tag, theme, Tooltip,
} from 'antd';

const tagInputStyle: React.CSSProperties = {
  width: 64,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: 'top',
};

interface waivioTagsProps {
  setParentTags: React.Dispatch<React.SetStateAction<string[]>>
  initialTags: string[]
  container?: HTMLElement
}

const WaivioTags = ({ setParentTags, initialTags, container }: waivioTagsProps) => {
  const { token } = theme.useToken();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputValue]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    setParentTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue];
      setTags(newTags);
      setParentTags(newTags);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    setTags(newTags);
    setParentTags(newTags);
    setEditInputIndex(-1);
    setEditInputValue('');
  };

  const tagPlusStyle: React.CSSProperties = {
    height: 20,
    background: token.colorBgContainer,
    borderStyle: 'dashed',
    cursor: 'pointer',
  };

  return (
        <Flex gap="4px 0" wrap>
            {tags.map<React.ReactNode>((tag, index) => {
              if (editInputIndex === index) {
                return (
                        <Input
                            ref={editInputRef}
                            key={tag}
                            size="small"
                            style={tagInputStyle}
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                        />
                );
              }
              const isLongTag = tag.length > 20;
              const tagElem = (
                    <Tag
                        key={tag}
                        closable={index !== 0}
                        style={{ userSelect: 'none' }}
                        onClose={() => handleClose(tag)}
                    >
            <span
                onDoubleClick={(e) => {
                  if (index !== 0) {
                    setEditInputIndex(index);
                    setEditInputValue(tag);
                    e.preventDefault();
                  }
                }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
                    </Tag>
              );
              return isLongTag ? (
                    <Tooltip
                      title={tag}
                      key={tag}
                      getPopupContainer={() => container || document.body}
                    >
                        {tagElem}
                    </Tooltip>
              ) : (
                tagElem
              );
            })}
            {inputVisible ? (
                <Input
                    ref={inputRef}
                    type="text"
                    size="small"
                    style={tagInputStyle}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                />
            ) : (
                <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
                    New tag
                </Tag>
            )}
        </Flex>
  );
};

export default WaivioTags;
