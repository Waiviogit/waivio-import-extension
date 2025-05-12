import React, { useState } from 'react';
import { ConfigProvider, Form } from 'antd';
import { THEME_CONFIG } from '../constants/styles';
import { EditAiModalProps } from '../types/product';
import { DraggableModal } from './DraggableModal';
import { FormField } from './FormField';

const EditAiModal = ({ product, title = 'Post draft' }: EditAiModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
    console.log(values);

    document.body.removeChild(nested);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
    document.body.removeChild(nested);
  };

  return (
    <ConfigProvider theme={THEME_CONFIG}>
      <DraggableModal
        title={title}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={product}
        >
          <FormField label="Product Name" name="name" />
          <FormField label="Brand" name="brand" />
          <FormField label="Manufacturer" name="manufacturer" />
          <FormField label="Description" name="fieldDescription" type="textarea" />
          <FormField label="Price Amount" name="mostRecentPriceAmount" />
          <FormField label="Price Currency" name="mostRecentPriceCurrency" />
          <FormField label="Weight" name="weight" />
          <FormField label="Rating" name="fieldRating" />
          <FormField label="Categories:" name="categories" type="list" />
          <FormField label="Merchants" name={['merchants', 0, 'name']} />
          <FormField label="Features:" name="features" type="keyValue" />
          <FormField label="Options:" name="waivio_options" type="categoryValue" />
        </Form>
      </DraggableModal>
    </ConfigProvider>
  );
};

export default EditAiModal;
