export interface ProductFeature {
    key: string;
    value: string;
}

export interface WaivioOption {
    category: string;
    value: string;
    image?: string;
}

export interface Merchant {
    name: string;
}

export interface Product {
    primaryImageURLs: string[];
    imageURLs: string[]
    categories: string[];
    fieldDescription: string;
    name: string;
    waivio_options: WaivioOption[];
    brand: string;
    features: ProductFeature[];
    waivio_product_ids: ProductFeature[];
    groupId: string;
    manufacturer: string;
    merchants: Merchant[];
    mostRecentPriceAmount: string;
    compareAtPriceAmount: string;
    mostRecentPriceCurrency: string;
    weight: string;
    fieldRating: string;
    objectType?: 'product' | 'book';
    websites?: string[]
    galleryLength?: number
}

export interface EditAiModalProps {
    product: Product;
    title?: string;
}
