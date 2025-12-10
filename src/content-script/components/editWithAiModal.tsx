import React, { useState } from 'react';
import { ConfigProvider, Form } from 'antd';
import { THEME_CONFIG, MODAL_IDS } from '../constants';
import { EditAiModalProps } from '../types/product';
import { DraggableModal } from './DraggableModal';
import { FormField } from './FormField';
import { PRODUCT_FORM_FIELDS, PERSON_FORM_FIELDS, BUSINESS_FORM_FIELDS } from '../config/formFields';
import { ImagePreview } from './ImagePreview';
import { FormFieldConfig } from '../types/form';
import { downloadToWaivio } from '../helpers/downloadWaivioHelper';

type ObjectType = 'product' | 'person' | 'business';

const FORM_FIELDS_BY_TYPE: Record<ObjectType, FormFieldConfig[]> = {
  product: PRODUCT_FORM_FIELDS,
  person: PERSON_FORM_FIELDS,
  business: BUSINESS_FORM_FIELDS,
};

interface ValidationError {
  errorFields?: Array<{
    name: string[];
    errors: string[];
    warnings: string[];
  }>;
  message?: string;
}

const EditAiModal = ({ product, title = 'Object draft', objectType }: EditAiModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const object = await form.validateFields();
      if (object?.features?.length) {
        object.features = object.features
          .map((el: {value: string}) => ({ ...el, value: [el.value] }));
      }
      const nested = document.getElementById(MODAL_IDS.MAIN_MODAL_HOST);
      if (!nested) return;
      await downloadToWaivio({
        object,
        objectType,
      });

      document.body.removeChild(nested);
    } catch (error) {
      const validationError = error as ValidationError;
      const message = validationError?.errorFields?.length
        ? validationError.errorFields.map((field) => `${field.name.join('.')}: ${field.errors.join(', ')}`).join('\n')
        : validationError?.message;
      alert(message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    const nested = document.getElementById(MODAL_IDS.MAIN_MODAL_HOST);
    if (!nested) return;
    document.body.removeChild(nested);
  };

  const renderFormFields = () => {
    const fields = FORM_FIELDS_BY_TYPE[objectType as ObjectType] ?? PRODUCT_FORM_FIELDS;

    return fields.map((field) => {
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
          initialValues={{ ...product }}
        >
          {renderFormFields()}
        </Form>
      </DraggableModal>
    </ConfigProvider>
  );
};

export default EditAiModal;
