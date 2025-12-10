export type FormFieldType = 'text' | 'textarea' | 'list' | 'keyValue' | 'categoryValue' | 'imageUrl' | 'imageList' | 'select' | 'number';

export interface FormFieldConfig {
  label: string;
  name: string | (string | number)[];
  type?: FormFieldType;
  maxItems?: number;
  showPreview?: boolean;
  required?: boolean;
  rules?: any[];
  options?: { value: string; label: string }[];
  dependencies?: string[];
}

export interface ImagePreviewProps {
  value: string[];
  style?: React.CSSProperties;
}

export interface FormFieldProps extends Omit<FormFieldConfig, 'showPreview'> {
  preview?: React.ReactNode;
}
