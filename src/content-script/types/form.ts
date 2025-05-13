export type FormFieldType = 'text' | 'textarea' | 'list' | 'keyValue' | 'categoryValue' | 'imageUrl' | 'imageList';

export interface FormFieldConfig {
  label: string;
  name: string | (string | number)[];
  type?: FormFieldType;
  maxItems?: number;
  showPreview?: boolean;
}

export interface ImagePreviewProps {
  value: string[];
  style?: React.CSSProperties;
}

export interface FormFieldProps extends Omit<FormFieldConfig, 'showPreview'> {
  preview?: React.ReactNode;
}
