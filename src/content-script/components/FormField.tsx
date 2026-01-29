import React, { useState } from 'react';
import {
  Form, Input, InputNumber, Space, Button, Image, Select,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ImageUploadModal } from './ImageUploadModal';

interface FormFieldProps {
    label: string;
    name: string | (string | number)[];
    type?: 'text' | 'textarea' | 'list' | 'keyValue' | 'categoryValue' | 'imageUrl' | 'imageList' | 'select' | 'number';
    rows?: number;
    preview?: React.ReactNode;
    maxItems?: number;
    required?: boolean;
    rules?: any[];
    options?: { value: string; label: string }[];
    dependencies?: string[];
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  rows = 4,
  preview,
  maxItems = 10,
  required,
  rules,
  options,
  dependencies,
}) => {
  if (type === 'number') {
    return (
            <Form.Item
                label={<span style={{ fontWeight: 600 }}>{label}</span>}
                name={name}
                rules={rules}
                dependencies={dependencies}
            >
                <InputNumber style={{ width: '100%' }} onKeyDown={(e) => e.stopPropagation()}/>
            </Form.Item>
    );
  }

  if (type === 'select') {
    return (
            <Form.Item
                label={<span style={{ fontWeight: 600 }}>{label}</span>}
                name={name}
                rules={rules}
            >
                <Select
                    options={options}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                />
            </Form.Item>
    );
  }

  if (type === 'imageUrl') {
    return (
            <Form.Item
                label={<span style={{ fontWeight: 600 }}>{label}</span>}
                name={name}
                rules={rules}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input placeholder="Enter image URL" onKeyDown={(e) => e.stopPropagation()}/>
                    {preview}
                </Space>
            </Form.Item>
    );
  }

  if (type === 'imageList') {
    return (
            <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>}>
                <Form.List name={name}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={fieldName}
                                        rules={[{ required: true, message: `Missing ${label.toLowerCase()}` }]}
                                    >
                                        <Input placeholder="Enter image URL" onKeyDown={(e) => e.stopPropagation()}/>
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(fieldName)}/>
                                </Space>
                            ))}
                            <Form.Item>
                                {fields.length < maxItems && (
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                        Add image URL
                                    </Button>
                                )}
                            </Form.Item>
                            {preview}
                        </>
                    )}
                </Form.List>
            </Form.Item>
    );
  }

  if (type === 'textarea') {
    return (
            <Form.Item
                label={<span style={{ fontWeight: 600 }}>{label}</span>}
                name={name}
                rules={rules}
            >
                <Input.TextArea rows={rows} onKeyDown={(e) => e.stopPropagation()}/>
            </Form.Item>
    );
  }

  if (type === 'list') {
    return (
            <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>}>
                <Form.List name={name}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={fieldName}
                                        rules={[{ required: true, message: `Missing ${label.toLowerCase()}` }]}
                                    >
                                        <Input
                                            placeholder={label}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(fieldName)}/>
                                </Space>
                            ))}
                            <Form.Item>
                                {fields.length < maxItems && (
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined/>}
                                    >
                                        Add
                                    </Button>
                                )}
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>
    );
  }

  if (type === 'keyValue') {
    return (
            <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>}>
                <Form.List name={name} rules={rules}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name: fieldName, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[fieldName, 'key']}
                                        rules={[{ required: true, message: 'Missing key' }]}
                                    >
                                        <Input placeholder="Key" onKeyDown={(e) => e.stopPropagation()}/>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[fieldName, 'value']}
                                        rules={[{ required: true, message: 'Missing value' }]}
                                    >
                                        <Input placeholder="Value" onKeyDown={(e) => e.stopPropagation()}/>
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(fieldName)}/>
                                </Space>
                            ))}
                            <Form.Item>
                                {fields.length < maxItems && (
                                    <Button type="dashed" onClick={() => add({ key: '', value: '' })} block icon={<PlusOutlined/>}>
                                        Add
                                    </Button>
                                )}
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>
    );
  }

  if (type === 'categoryValue') {
    const formInstance = Form.useFormInstance();
    const [uploadIndex, setUploadIndex] = useState<number | null>(null);

    const fieldListName = Array.isArray(name) ? name : [name];

    return (
            <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>}>
                <Form.List name={name}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name: fieldName, ...restField }) => {
                              const imagePath = [...fieldListName, fieldName, 'image'];
                              const imageValue = formInstance.getFieldValue(imagePath);
                              const openUpload = () => setUploadIndex(Number(fieldName));
                              const removeImage = () => (
                                formInstance.setFieldValue(imagePath, undefined)
                              );

                              return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                        <Space style={{ display: 'flex' }} align="center">
                                            <Form.Item
                                                {...restField}
                                                name={[fieldName, 'category']}
                                                rules={[{ required: true, message: 'Missing category' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input placeholder="Category" onKeyDown={(e) => e.stopPropagation()}/>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[fieldName, 'value']}
                                                rules={[{ required: true, message: 'Missing value' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input placeholder="Value" onKeyDown={(e) => e.stopPropagation()}/>
                                            </Form.Item>
                                        </Space>

                                        <Space style={{ marginLeft: 8 }} align="center">
                                            {imageValue ? (
                                                <Image
                                                    src={imageValue}
                                                    width={32}
                                                    height={32}
                                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                                    preview={false}
                                                />
                                            ) : (
                                                <Button
                                                    size="small"
                                                    onClick={openUpload}
                                                >
                                                    Add image
                                                </Button>
                                            )}
                                            {imageValue && (
                                                <Button
                                                    size="small"
                                                    onClick={openUpload}
                                                >
                                                    Change
                                                </Button>
                                            )}
                                            {imageValue && (
                                                <Button
                                                    size="small"
                                                    danger
                                                    onClick={removeImage}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                            <MinusCircleOutlined
                                                style={{ marginLeft: 8 }}
                                                onClick={() => remove(fieldName)}
                                            />
                                        </Space>

                                        <ImageUploadModal
                                            visible={uploadIndex === Number(fieldName)}
                                            onCancel={() => setUploadIndex(null)}
                                            onImageUpload={(url) => {
                                              formInstance.setFieldValue(imagePath, url);
                                              setUploadIndex(null);
                                            }}
                                        />
                                    </div>
                              );
                            })}
                            <Form.Item>
                                {fields.length < maxItems && (
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                        Add
                                    </Button>
                                )}
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>
    );
  }

  return (
        <Form.Item
            label={<span style={{ fontWeight: 600 }}>{label}</span>}
            name={name}
            rules={rules}
        >
            <Input onKeyDown={(e) => e.stopPropagation()}/>
        </Form.Item>
  );
};
