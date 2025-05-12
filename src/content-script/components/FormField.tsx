import React from 'react';
import {
  Form, Input, Space, Button, Image,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface FormFieldProps {
    label: string;
    name: string | (string | number)[];
    type?: 'text' | 'textarea' | 'list' | 'keyValue' | 'categoryValue' | 'imageUrl' | 'imageList';
    rows?: number;
    preview?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label, name, type = 'text', rows = 4, preview,
}) => {
  if (type === 'imageUrl') {
    return (
      <Form.Item label={label} name={name}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="Enter image URL" />
          {preview}
        </Space>
      </Form.Item>
    );
  }

  if (type === 'imageList') {
    console.log(preview);
    return (
      <Form.Item label={label}>
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
                    <Input placeholder="Enter image URL" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Image URL
                </Button>
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
            <Form.Item label={label} name={name}>
                <Input.TextArea rows={rows} />
            </Form.Item>
    );
  }

  if (type === 'list') {
    return (
      <Form.Item label={label}>
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
                    <Input placeholder={label} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add {label}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>
    );
  }

  if (type === 'keyValue') {
    return (
      <Form.Item label={label}>
        <Form.List name={name}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: fieldName, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'key']}
                    rules={[{ required: true, message: 'Missing key' }]}
                  >
                    <Input placeholder="Key" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'value']}
                    rules={[{ required: true, message: 'Missing value' }]}
                  >
                    <Input placeholder="Value" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Feature
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>
    );
  }

  if (type === 'categoryValue') {
    return (
      <Form.Item label={label}>
        <Form.List name={name}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: fieldName, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'category']}
                    rules={[{ required: true, message: 'Missing category' }]}
                  >
                    <Input placeholder="Category" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, 'value']}
                    rules={[{ required: true, message: 'Missing value' }]}
                  >
                    <Input placeholder="Value" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Option
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>
    );
  }

  return (
        <Form.Item label={label} name={name}>
            <Input />
        </Form.Item>
  );
};
