import React from 'react';
import {
  Form, Input, Space, Button, Image, Select,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface FormFieldProps {
    label: string;
    name: string | (string | number)[];
    type?: 'text' | 'textarea' | 'list' | 'keyValue' | 'categoryValue' | 'imageUrl' | 'imageList' | 'select';
    rows?: number;
    preview?: React.ReactNode;
    maxItems?: number;
    required?: boolean;
    rules?: any[];
    options?: { value: string; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({
  label, name, type = 'text', rows = 4, preview, maxItems = 10, required, rules, options,
}) => {
  if (type === 'select') {
    return (
      <Form.Item label={label} name={name} rules={rules}>
        <Select
          options={options}
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
        />
      </Form.Item>
    );
  }

  if (type === 'imageUrl') {
    return (
      <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>} name={name} rules={rules}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="Enter image URL" />
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
                    <Input placeholder="Enter image URL" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Form.Item>
                {fields.length < maxItems && (
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
            <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>} name={name} rules={rules}>
                <Input.TextArea rows={rows} />
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
                    <Input placeholder={label} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Form.Item>
                {fields.length < maxItems && (
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
                {fields.length < maxItems && (
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
    return (
      <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>}>
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
                {fields.length < maxItems && (
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
        <Form.Item label={<span style={{ fontWeight: 600 }}>{label}</span>} name={name} rules={rules}>
            <Input />
        </Form.Item>
  );
};
