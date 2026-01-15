import { useState, useEffect } from 'react';
import { ConfigProvider, Form, Spin } from 'antd';
import { THEME_CONFIG, MODAL_IDS } from '../constants';
import { DraggableModal } from './DraggableModal';
import { FormField } from './FormField';
import { PRODUCT_FORM_FIELDS, PERSON_FORM_FIELDS, BUSINESS_FORM_FIELDS } from '../config/formFields';
import { ImagePreview } from './ImagePreview';
import { FormFieldConfig } from '../types/form';
import { downloadToWaivio, loadImageBase64 } from '../helpers/downloadWaivioHelper';
import { getWaivioUserInfo } from '../helpers/userHelper';
import { generateObjectFromImage } from '../helpers/objectHelper';
import {
  getWaivioProductIds,
  getAvatarAndGallery,
  UserInfo, getDistriatorObject,
} from '../editAi/editWithAi';

type ObjectType = 'product' | 'person' | 'business';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductData = Record<string, any>;

interface EditAiModalProps {
  objectType: string;
  title?: string;
  imageBlob?: Blob | null;
}

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

const getGalleryLength = (aiResult: ProductData | null): number => {
  if (!aiResult) return 3;
  const len = aiResult?.galleryLength as number || 0;
  if (len > 2) return len - 1;
  return aiResult?.galleryLength as number || 1;
};

const EditAiModal = ({ title = 'Object draft', objectType, imageBlob }: EditAiModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [currentUrl, setCurrentUrl] = useState(document.URL);
  const [form] = Form.useForm();

  useEffect(() => {
    // Update current URL to track page changes
    setCurrentUrl(document.URL);
  }, []);

  useEffect(() => {
    const fetchObjectData = async () => {
      setIsLoading(true);
      setProduct(null); // Clear previous data to avoid stale data from other tabs

      const pageUrl = document.URL; // Capture URL at the start of the effect

      const userInfo = await getWaivioUserInfo();
      if (!userInfo) {
        setIsLoading(false);
        setProduct({ websites: [pageUrl] });
        return;
      }
      const {
        accessToken, guestName, userName, auth,
      } = userInfo as UserInfo;

      if (pageUrl.includes('distriator.com')) {
        const waivioProductIds = await getWaivioProductIds({
          user: userName,
          auth,
          accessToken,
          guestName,
        });

        const object = {
          ...await getDistriatorObject(),
          ...(objectType === 'business'
            ? { waivio_company_ids: waivioProductIds || [] }
            : { waivio_product_ids: waivioProductIds || [] }),
        };

        setIsLoading(false);
        setProduct(object);
        return;
      }

      let aiResult: ProductData | null = null;

      // Try to get AI-generated object, but continue even if it fails
      try {
        if (imageBlob) {
          const { result: imageUrl } = await loadImageBase64(imageBlob);
          if (imageUrl) {
            const response = await generateObjectFromImage({
              accessToken, guestName, auth, user: userName, url: imageUrl, objectType,
            });

            if (!('error' in response) && response.result) {
              aiResult = response.result;

              // Process socialLinks if present
              if (aiResult && aiResult.socialLinks && typeof aiResult.socialLinks === 'object') {
                const processedSocialLinks: Record<string, string> = {};
                for (const [key, value] of Object.entries(aiResult.socialLinks)) {
                  if (typeof value === 'string' && value.trim()) {
                    try {
                      const url = new URL(value);
                      let path = url.pathname;
                      // Remove leading slash
                      if (path.startsWith('/')) {
                        path = path.substring(1);
                      }
                      processedSocialLinks[key] = path;
                    } catch {
                      // If URL parsing fails, keep original value
                      processedSocialLinks[key] = value;
                    }
                  } else {
                    processedSocialLinks[key] = value as string;
                  }
                }
                aiResult.socialLinks = processedSocialLinks;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to generate object from image:', err);
      }

      const galleryLength = getGalleryLength(aiResult);

      try {
        const [waivioProductIds, { primaryImageURLs, imageURLs }] = await Promise.all([
          getWaivioProductIds({
            user: userName,
            auth,
            accessToken,
            guestName,
          }),
          getAvatarAndGallery({
            user: userName,
            auth,
            accessToken,
            guestName,
            galleryLength,
          }),
        ]);

        const hasWebsites = aiResult?.websites && Array.isArray(aiResult.websites)
          && aiResult.websites.length > 0;

        const object = {
          ...(aiResult || {}),
          primaryImageURLs: primaryImageURLs || [],
          imageURLs: imageURLs || [],
          ...(objectType === 'business'
            ? { waivio_company_ids: waivioProductIds || [] }
            : { waivio_product_ids: waivioProductIds || [] }),
          ...(!hasWebsites && { websites: [pageUrl] }),
        };

        setProduct(object);
        form.setFieldsValue(object);
      } catch (error) {
        console.error('Error fetching product data:', error);
        // Even on error, set empty form with website
        const fallbackObject = {
          ...(aiResult || {}),
          websites: [pageUrl],
        };
        setProduct(fallbackObject);
        form.setFieldsValue(fallbackObject);
      }

      setIsLoading(false);
    };

    fetchObjectData();
  }, [objectType, form, imageBlob, currentUrl]);

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
        okButtonProps={{ disabled: isLoading }}
      >
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}>
            <Spin size="large" tip="Generating object data..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ ...product }}
          >
            {renderFormFields()}
          </Form>
        )}
      </DraggableModal>
    </ConfigProvider>
  );
};

export default EditAiModal;
