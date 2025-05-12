import { useState } from 'react';
import {
  ConfigProvider, Modal, Form, Input, Space, Button,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface ProductFeature {
    key: string;
    value: string;
}

interface WaivioOption {
    category: string;
    value: string;
}

interface Merchant {
    name: string;
}

interface Product {
    categories: string[];
    fieldDescription: string;
    name: string;
    waivio_options: WaivioOption[];
    brand: string;
    features: ProductFeature[];
    manufacturer: string;
    merchants: Merchant[];
    mostRecentPriceAmount: string;
    mostRecentPriceCurrency: string;
    weight: string;
    fieldRating: string;
}

interface EditAiModalProps {
    product: Product
    title?: string
}
const EditAiModal = ({ product, title = 'Post draft' }: EditAiModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [form] = Form.useForm();
  const [editedProduct, setEditedProduct] = useState(product);

  const handleOk = async () => {
    const values = await form.validateFields();
    setEditedProduct(values);
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
    document.body.removeChild(nested);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
    document.body.removeChild(nested);
  };

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#f87007',
          },
        }}
      >
        <Modal
          bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
          title={title}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Copy"
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={product}
          >
            <Form.Item label="Product Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Brand" name="brand">
              <Input />
            </Form.Item>
            <Form.Item label="Manufacturer" name="manufacturer">
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="fieldDescription">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Price Amount" name="mostRecentPriceAmount">
              <Input />
            </Form.Item>
            <Form.Item label="Price Currency" name="mostRecentPriceCurrency">
              <Input />
            </Form.Item>
            <Form.Item label="Weight" name="weight">
              <Input />
            </Form.Item>
            <Form.Item label="Rating" name="fieldRating">
                <Input />
            </Form.Item>

            <Form.Item label="Categories">
              <Form.List name="categories">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[{ required: true, message: 'Missing category' }]}
                        >
                          <Input placeholder="Category" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Category
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item label="Merchants" name={['merchants', 0, 'name']}>
              <Input />
            </Form.Item>

            <Form.Item label="Features">
              <Form.List name="features">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'key']}
                          rules={[{ required: true, message: 'Missing key' }]}
                        >
                          <Input placeholder="Key" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: true, message: 'Missing value' }]}
                        >
                          <Input placeholder="Value" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
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

            <Form.Item label="Options">
              <Form.List name="waivio_options">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'category']}
                          rules={[{ required: true, message: 'Missing category' }]}
                        >
                          <Input placeholder="Category" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: true, message: 'Missing value' }]}
                        >
                          <Input placeholder="Value" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
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
          </Form>
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default EditAiModal;
