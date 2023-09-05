export const generateUniqueId = (): string => `element_${Math.random().toString(36).substr(2, 9)}`;
