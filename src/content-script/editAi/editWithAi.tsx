import ReactDOM from 'react-dom/client';
import EditAiModal from '../components/editWithAiModal';

const mock = {
  categories: [
    'Makeup',
    'Lipstick',
    'Lip Liner',
    'Lip Set',
    'Beauty & Body',
  ],
  fieldDescription: "What it is: A mini lip set featuring Charlotte’s iconic, bestselling Matte Revolution or K.I.S.S.I.N.G Lipstick with a Lip Cheat Lip Liner Pencil for a dreamy, nude-pink, kissable look.What Else You Need to Know: Charlotte Tilbury’s globally loved Pillow Talk duo is your ultimate secret weapon to re-shape and re-size the look of lips for a 'your lips but better' finish. Highlighted Ingredients:\n- Lipstick Tree and Orchid Extract: Visibly softens, protects, and hydrates lips.Ingredient Callouts: Free of parabens.",
  name: 'Charlotte Tilbury Beauty Mini Pillow Talk Lipstick & Liner Set - Fair',
  waivio_options: [
    {
      category: 'Color',
      value: 'Pillow Talk Fair',
    },
  ],
  brand: 'Charlotte Tilbury Beauty',
  features: [
    {
      key: 'Ingredient',
      value: 'Lipstick Tree Extract',
    },
    {
      key: 'Ingredient',
      value: 'Orchid Extract',
    },
    {
      key: 'Formulation',
      value: 'Paraben-Free',
    },
    {
      key: 'Set Contains',
      value: '0.02 oz / 0.8 g Lip Cheat Lip Liner in Pillow Talk Fair (cool pink nude)',
    },
    {
      key: 'Set Contains',
      value: '0.05 oz / 1.5 g K.I.S.S.I.N.G Lipstick in Pillow Talk Fair (cool pink nude)',
    },
  ],
  manufacturer: 'Charlotte Tilbury Beauty',
  merchants: [
    {
      name: 'Sephora',
    },
  ],
  mostRecentPriceAmount: '25.00',
  mostRecentPriceCurrency: 'USD',
  weight: '0.02 oz (Liner) + 0.05 oz (Lipstick)',
  fieldRating: '3',
};

export const editWithAi = async () => {
  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(<EditAiModal
      product={mock}
  />);
};
