import React, { useState } from 'react';
import { ConfigProvider, Form } from 'antd';
import { THEME_CONFIG } from '../constants/styles';
import { EditAiModalProps } from '../types/product';
import { DraggableModal } from './DraggableModal';
import { FormField } from './FormField';
import { PRODUCT_FORM_FIELDS } from '../config/formFields';
import { ImagePreview } from './ImagePreview';

const EditAiModal = ({ product, title = 'Object draft' }: EditAiModalProps) => {
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

  const renderFormFields = () => PRODUCT_FORM_FIELDS.map((field) => {
    const preview = field.showPreview ? (
        <Form.Item noStyle shouldUpdate>
          {(formInstance) => {
            const value = formInstance.getFieldValue(field.name);
            return <ImagePreview value={value} />;
          }}
        </Form.Item>
    ) : null;

    return (
        <FormField
          key={field.name.toString()}
          {...field}
          preview={preview}
        />
    );
  });

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
          {renderFormFields()}
        </Form>
      </DraggableModal>
    </ConfigProvider>
  );
};

export default EditAiModal;
