export interface ProductFeature {
    key: string;
    value: string;
}

export interface WaivioOption {
    category: string;
    value: string;
}

export interface Merchant {
    name: string;
}

export interface Product {
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

export interface EditAiModalProps {
    product: Product;
    title?: string;
}
